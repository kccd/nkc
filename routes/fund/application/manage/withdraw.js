const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {data, nkcModules, state, body} = ctx;
    const {fund, applicationForm} = data;
    const {reason} = body;
    nkcModules.checkData.checkString(reason, {
      name: '原因',
      minLength: 1,
      maxLength: 5000
    });
    if(
      !await fund.isFundRole(state.uid, 'admin') &&
      !await fund.isFundRole(state.uid, 'financialStaff')
    ) ctx.throw(403, `权限不足`);
    if(applicationForm.remittance[0].status === true) ctx.throw(400, '无法撤回已拨款的基金申请');
    await applicationForm.updateOne({
      'lock.submitted': false,
      'status.usersSupport': null,
      'status.projectPassed': null,
      'status.adminSupport': null
    });
    await applicationForm.createReport('system', `申请已被撤回\n原因：${reason}`, state.uid, false);
    await next();
  });
module.exports = router;