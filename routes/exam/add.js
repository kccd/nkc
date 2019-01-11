const router = new require('koa-router')();
module.exports = router;
router
  .get('/', async (ctx, next) => {
    ctx.template = 'exam/add.pug';
    await next();
  });
