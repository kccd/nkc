const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {data, body, nkcModules} = ctx;
    const {reason} = body;
    const {applicationForm} = data;
    nkcModules.checkData.checkString.checkString(reason, {
      name: '原因',
      minLength: 1,
      maxLength: 10000
    });
    const status = await applicationForm.getStatus();
    if(status.general > 3) ctx.throw(400, `已经通过审核的申请不能放弃，你可以点击结题按钮提前结题。`);
    await applicationForm.createReport('report', reason);
    await applicationForm.createReport('system', '申请人已放弃');
    await applicationForm.updateOne({
      $set: {
        useless: 'giveUp'
      }
    });
    await next();
  });
module.exports = router;