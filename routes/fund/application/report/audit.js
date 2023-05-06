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
    const { state, data } = ctx;
    const { fund, applicationForm } = data;
    await fund.checkFundRole(state.uid, 'expert');
    if (!applicationForm.submittedReport) {
      ctx.throw(400, '申请人暂未提交报告。');
    }
    await next();
  })
  .get('/', async (ctx, next) => {
    const { data, db } = ctx;
    data.type = 'reportAudit';
    data.nav = '报告审核';
    const { applicationForm } = data;
    const { remittance, reportNeedThreads } = applicationForm;
    for (let r of remittance) {
      if (r.status === null && r.passed === null) {
        if (reportNeedThreads && r.threads && r.threads.length !== 0) {
          data.threads = await Promise.all(
            r.threads.map(async (t) => {
              const thread = await db.ThreadModel.findOnly({ tid: t });
              await thread.extendFirstPost().then((p) => p.extendUser());
              return thread;
            }),
          );
        }
        data.report = await db.FundOperationModel.findOne({ _id: r.report });
        break;
      }
    }
    ctx.template = 'fund/report/audit.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const { data, db, body } = ctx;
    const { applicationForm, user } = data;
    const { remittance } = applicationForm;
    const { number, support, c } = body;
    if (number === undefined) {
      ctx.throw(400, '参数错误');
    }
    for (let i = 0; i < remittance.length; i++) {
      const r = remittance[i];
      if (!r.apply && i === number) {
        ctx.throw(400, '申请人暂未提交报告。');
      }
      if ((i < number && !r.status) || (i > number && r.status)) {
        ctx.throw(400, '参数错误。');
      }
      if (i === number && r.status) {
        ctx.throw(400, '该报告已通过审核。');
      }
    }

    /*const operationType = support
      ? fundOperationTypes.disbursementApproved
      : fundOperationTypes.disbursementNotApproved;
    await fundOperationService.createFundOperation({
      uid: user.uid,
      formId: applicationForm._id,
      type: operationType,
      status: fundOperationStatus.normal,
      desc: c,
    });*/
    /*const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
    const newDocument = db.FundDocumentModel({
      _id: newId,
      uid: user.uid,
      type: 'reportAudit',
      applicationFormId: applicationForm._id,
      c,
      support,
    });
    await newDocument.save();*/
    for (let i = 0; i < remittance.length; i++) {
      const r = remittance[i];
      if (r.status === null && r.passed === null) {
        r.passed = support;
        /*let str = `第 ${i + 1} 期拨款申请通过审核`;
        if (!support) {
          str = `第 ${i + 1} 期拨款申请未通过审核\n${c}`;
        }*/
        await applicationForm.updateOne({ remittance, submittedReport: false });

        const operationType = support
          ? fundOperationTypes.disbursementApproved
          : fundOperationTypes.disbursementNotApproved;
        await fundOperationService.createFundOperation({
          uid: user.uid,
          formId: applicationForm._id,
          type: operationType,
          status: fundOperationStatus.normal,
          desc: c,
          installment: i + 1,
        });

        /*const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
        const newReport = db.FundDocumentModel({
          _id: newId,
          uid: user.uid,
          type: 'system',
          applicationFormId: applicationForm._id,
          c: str,
          support,
        });
        await newReport.save();*/
        break;
      }
    }
    if (!support) {
      // 报告为通过审核 通知申请人
      await db.MessageModel.sendFundMessage(applicationForm._id, 'applicant');
    } else {
      // 报告通过审核 通知财务拨款
      await db.MessageModel.sendFundMessage(
        applicationForm._id,
        'financialStaff',
      );
    }
    await next();
  });
module.exports = router;
