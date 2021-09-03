const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {data, state, body, nkcModules} = ctx;
    const {applicationForm, fund} = data;
    const {reason} = body;
    if(
      !await fund.isFundRole(state.uid, 'expert') &&
      !await fund.isFundRole(state.uid, 'admin')
    ) {
      ctx.throw(403, `你不是基金专家或基金管理员，没有权限执行当前操作`);
    }
    nkcModules.checkData.checkString(reason, {
      name: '拒绝理由',
      minLength: 1,
      maxLength: 5000
    });
    const status = await applicationForm.getStatus();
    if(status.general > 3) {
      ctx.throw(403, `项目进行中，无法完成当前操作`);
    }
    await applicationForm.createReport('refuse', reason, state.uid, false);
    await applicationForm.updateOne({
      $set: {
        useless: 'refuse'
      }
    });
    await applicationForm.removeAllMembers();
    await next();
  });
module.exports = router;