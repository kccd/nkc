const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {data, state} = ctx;
    const {applicationForm} = data;
    await fund.checkFundRole(state.uid, 'admin');
    await applicationForm.setUselessAsTimeout(state.uid);
    await next();
  })
module.exports = router;