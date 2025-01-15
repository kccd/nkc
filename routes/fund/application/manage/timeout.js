const {
  OnlyOperation,
  OnlyUnbannedUser,
} = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');

const router = require('koa-router')();
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { data, state } = ctx;
  const { applicationForm } = data;
  await applicationForm.fund.checkFundRole(state.uid, 'admin');
  await applicationForm.setUselessAsTimeout(state.uid);
  await next();
});
module.exports = router;
