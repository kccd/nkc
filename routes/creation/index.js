const router = require('koa-router')();
const materialRouter = require('./material');
router
  .use('/', async (ctx, next) => {
    if(ctx.query.t) {
      ctx.template = 'creation/index.pug';
    } else {
      ctx.remoteTemplate = 'creation/index.pug';
    }
    await next();
  })
  .get('/', async (ctx, next) => {
    await next();
  })
  .use('/material', materialRouter.routes(), materialRouter.allowedMethods())
module.exports = router;