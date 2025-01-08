const {
  fundOperationStatus,
  fundOperationTypes,
} = require('../../../../settings/fundOperation');
const {
  fundOperationService,
} = require('../../../../services/fund/FundOperation.service');
const { OnlyUnbannedUser } = require('../../../../middlewares/permission');
const router = require('koa-router')();
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { data, body, nkcModules, state } = ctx;
  const { reason } = body;
  const { applicationForm } = data;
  nkcModules.checkData.checkString(reason, {
    name: '原因',
    minLength: 1,
    maxLength: 10000,
  });
  const status = await applicationForm.getStatus();
  if (status.general > 3) {
    ctx.throw(400, `已经通过审核的申请不能放弃，你可以点击结题按钮提前结题。`);
  }

  await fundOperationService.createFundOperation({
    uid: state.uid,
    formId: applicationForm._id,
    type: fundOperationTypes.applicantAbandoned,
    status: fundOperationStatus.normal,
    desc: reason,
  });

  /*await applicationForm.createReport('report', reason, state.uid);
  await applicationForm.createReport('system', '申请人已放弃申报', state.uid);*/
  await applicationForm.updateOne({
    $set: {
      useless: 'giveUp',
    },
  });
  await applicationForm.removeAllMembers();
  await next();
});
module.exports = router;
