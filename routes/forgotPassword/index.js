const Router = require('koa-router');
const router = new Router();
const mobileRouter = require('./mobile');
const emailRouter = require('./email');
router
  .get('/', async (ctx, next) => {
    ctx.template = 'forgotPassword/forgotPassword.pug';
    await next();
  })
  .use('/email', emailRouter.routes(), emailRouter.allowedMethods())
  .use('/mobile', mobileRouter.routes(), mobileRouter.allowedMethods());
module.exports = router;