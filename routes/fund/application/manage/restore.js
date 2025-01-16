const router = require('koa-router')();
const {
  fundOperationStatus,
  fundOperationTypes,
} = require('../../../../settings/fundOperation');
const {
  fundOperationService,
} = require('../../../../services/fund/FundOperation.service');
const {
  OnlyOperation,
  OnlyUnbannedUser,
} = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { data, state } = ctx;
  const { applicationForm } = data;
  const { fund } = applicationForm;
  await fund.checkFundRole(state.uid, 'admin');
  if (
    !['giveUp', 'refuse', 'stop', 'timeout'].includes(applicationForm.useless)
  ) {
    ctx.throw(403, `仅能恢复被申请人放弃、被审查员彻底拒绝的申请表`);
  }
  await fundOperationService.createFundOperation({
    uid: state.uid,
    formId: applicationForm._id,
    type: fundOperationTypes.cancelRefuse,
    status: fundOperationStatus.normal,
  });
  // await applicationForm.createReport('system', '申请表已恢复', state.uid);
  await applicationForm.updateOne({ useless: null });
  await next();
});
module.exports = router;
