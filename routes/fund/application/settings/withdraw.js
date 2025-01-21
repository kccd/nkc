const { OnlyUnbannedUser } = require('../../../../middlewares/permission');

const router = require('koa-router')();
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { data, state, body } = ctx;
  const { applicationForm } = data;
  const { reason } = body;
  await applicationForm.withdraw(state.uid, reason, true);
  await next();
});
module.exports = router;
