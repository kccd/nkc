const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {status} = ctx.data.applicationForm;
    if(status.completed) ctx.throw('该项目已结题');
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {applicationForm, user} = data;
    ctx.template = 'fund/complete/audit.pug';

    data.type = 'reportAudit';
    //结项审核  审查员权限判断
    const {fund, completedAudit} = applicationForm;
    if(!completedAudit) ctx.throw(403,'抱歉！申请人暂未提交结题申请。');
    if(!fund.ensureOperatorPermission('expert', user) && !fund.ensureOperatorPermission('admin', user)) ctx.throw(403,'抱歉！您没有资格进行结题审核。');
    data.report = await db.FundDocumentModel.findOne({type: 'completedReport', applicationFormId: applicationForm._id}).sort({toc: -1}).limit(1);
    data.nav = '结题审核';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {applicationForm, user} = data;
    const {c, passed} = body;
    //结项审核  审查员权限判断
    const {fund, completedAudit} = applicationForm;
    if(!completedAudit) ctx.throw(403,'抱歉！申请人暂未提交结题申请。');
    if(!fund.ensureOperatorPermission('expert', user) && !fund.ensureOperatorPermission('admin', user)) ctx.throw(403,'抱歉！您没有资格进行结题审核。');

    const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
    const newDocument = db.FundDocumentModel({
      _id: newId,
      c: c,
      type: 'completedAudit',
      support: passed,
      applicationFormId: applicationForm._id,
      uid: user.uid
    });
    await newDocument.save();
    if(passed) {
      await applicationForm.updateOne({'status.completed': true, completedAudit: false, tlm: Date.now()});
    } else {
      await applicationForm.updateOne({'status.completed': false, completedAudit: false});
    }
    await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");
    await next();
  });
module.exports = router;