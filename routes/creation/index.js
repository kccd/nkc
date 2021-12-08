const router = require('koa-router')();
const materialRouter = require('./material');
router
  .get('/', async (ctx, next) => {
    if(ctx.query.t) {
      ctx.template = 'creation/home.pug';
    } else {
      ctx.remoteTemplate = 'creation/home.pug';
    }
    await next();
  })
  .use('/material', materialRouter.routes(), materialRouter.allowedMethods())
module.exports = router;