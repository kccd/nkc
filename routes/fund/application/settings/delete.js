const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {data} = ctx;
    const {applicationForm} = data;
    if(applicationForm.submitted) ctx.throw(400, '无法删除已提交的申请表，放弃申请请点击放弃按钮。');
    await applicationForm.updateOne({
      $set: {
        useless: 'delete'
      }
    });
    await applicationForm.removeAllMembers();
    await next();
  });
module.exports = router;