const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {data, body, state} = ctx;
    const {applicationForm} = data;
    const {fund} = applicationForm;
    await fund.checkFundRole(state.uid, 'admin');
    if(!['giveUp', 'refuse'].includes(applicationForm.useless)) {
      ctx.throw(403, `仅能恢复被申请人放弃、被审查员彻底拒绝的申请表`);
    }
    await applicationForm.createReport('system', '申请表已恢复', state.uid);
    await applicationForm.updateOne({useless: null});
    await next();
  });
module.exports = router;