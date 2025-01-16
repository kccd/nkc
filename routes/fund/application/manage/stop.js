const router = require('koa-router')();
const {
  fundOperationTypes,
  fundOperationStatus,
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
  const { state, data, body, nkcModules } = ctx;
  const { fund, applicationForm } = data;
  const { reason } = body;
  nkcModules.checkData.checkString(reason, {
    name: '原因',
    minLength: 1,
    maxLength: 5000,
  });
  await fund.checkFundRole(state.uid, 'admin');

  await fundOperationService.createFundOperation({
    uid: state.uid,
    formId: applicationForm._id,
    type: fundOperationTypes.terminated,
    status: fundOperationStatus.normal,
    desc: reason,
  });
  /*await applicationForm.createReport(
    'system',
    `项目已终止\n原因：${reason}`,
    state.uid,
    false,
  );*/
  await applicationForm.updateOne({
    $set: {
      useless: 'stop',
    },
  });
  await next();
});
module.exports = router;
