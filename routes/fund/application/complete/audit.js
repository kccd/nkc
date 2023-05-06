const router = require('koa-router')();
const {
  fundOperationStatus,
  fundOperationTypes,
} = require('../../../../settings/fundOperation');
const {
  fundOperationService,
} = require('../../../../services/fund/FundOperation.service');
router
  .use('/', async (ctx, next) => {
    const { status } = ctx.data.applicationForm;
    if (status.completed) {
      ctx.throw('该项目已结题');
    }
    await next();
  })
  .get('/', async (ctx, next) => {
    const { data, db } = ctx;
    const { applicationForm, user } = data;
    ctx.template = 'fund/complete/audit.pug';

    data.type = 'reportAudit';
    //结项审核  审查员权限判断
    const { fund, completedAudit } = applicationForm;
    if (!completedAudit) {
      ctx.throw(403, '抱歉！申请人暂未提交结题申请。');
    }
    if (
      !(await fund.ensureOperatorPermission('expert', user)) &&
      !(await fund.ensureOperatorPermission('admin', user))
    ) {
      ctx.throw(403, '抱歉！您没有资格进行结题审核。');
    }
    data.report = await db.FundOperationModel.findOne({
      type: fundOperationTypes.submitFinalReport,
      formId: applicationForm._id,
    }).sort({ toc: -1 });
    /*data.report = await db.FundDocumentModel.findOne({
      type: 'completedReport',
      applicationFormId: applicationForm._id,
    })
      .sort({ toc: -1 })
      .limit(1);*/
    data.nav = '结题审核';
    await next();
  })
  .post('/', async (ctx, next) => {
    const { data, db, body } = ctx;
    const { applicationForm, user } = data;
    const { c, passed } = body;
    //结项审核  审查员权限判断
    const { fund, completedAudit } = applicationForm;
    if (!completedAudit) {
      ctx.throw(403, '抱歉！申请人暂未提交结题申请。');
    }
    if (
      !(await fund.ensureOperatorPermission('expert', user)) &&
      !(await fund.ensureOperatorPermission('admin', user))
    ) {
      ctx.throw(403, '抱歉！您没有资格进行结题审核。');
    }

    const operationType = passed
      ? fundOperationTypes.finalReportApproved
      : fundOperationTypes.finalReportNotApproved;
    await fundOperationService.createFundOperation({
      uid: user.uid,
      formId: applicationForm._id,
      type: operationType,
      status: fundOperationStatus.normal,
      desc: c,
    });
    /*const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
    const newDocument = db.FundDocumentModel({
      _id: newId,
      c: c,
      type: 'completedAudit',
      support: passed,
      applicationFormId: applicationForm._id,
      uid: user.uid,
    });
    await newDocument.save();*/
    if (passed) {
      // 判断是否需要退款
      const refundMoney = await applicationForm.getRefundMoney();
      await applicationForm.updateOne({
        refundMoney,
        'status.completed': true,
        'status.refund': refundMoney > 0 ? false : null,
        completedAudit: false,
        tlm: Date.now(),
      });
    } else {
      await applicationForm.updateOne({
        'status.completed': false,
        completedAudit: false,
      });
    }
    await db.MessageModel.sendFundMessage(applicationForm._id, 'applicant');
    await next();
  });
module.exports = router;
