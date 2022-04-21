const router = require("koa-router")();
const subRouter = require('./subscribe');
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .use('/', async (ctx, next) => {
    ctx.template = 'vueRoot/index.pug';
    await next();
  })
  .use('/sub', subRouter.routes(), subRouter.allowedMethods())

module.exports = router;
