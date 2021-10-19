const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {data, state, body} = ctx;
    const {applicationForm} = data;
    const {reason} = body;
    await applicationForm.withdraw(state.uid, reason);
    await next();
  });
module.exports = router;