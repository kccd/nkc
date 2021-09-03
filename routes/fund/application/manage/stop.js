const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {state, data, db, body, nkcModules} = ctx;
    const {fund, applicationForm} = data;
    const {reason} = body;
    nkcModules.checkData.checkString(reason, {
      name: '原因',
      minLength: 1,
      maxLength: 5000
    });
    await fund.checkFundRole(state.uid, 'admin');
    await applicationForm.createReport('system', `项目已终止\n原因：${reason}`, state.uid, false);
    await applicationForm.updateOne({
      $set: {
        useless: 'stop'
      }
    });
    await next();
  })
module.exports = router;