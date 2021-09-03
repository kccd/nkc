const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {data} = ctx;
    const {applicationForm} = data;
    if(applicationForm.remittance[0].status !== false) ctx.throw(400, '无法完成该操作。');
    applicationForm.lock.submitted = false;
    await applicationForm.updateOne({
      'lock.submitted': applicationForm.lock.submitted
    });
    await next();
  });
module.exports = router;