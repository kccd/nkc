const Router = require('koa-router');
const experimentalRouter = new Router();


experimentalRouter
  .get('/', async (ctx, next) => {
    ctx.data = `管`;
    await next();
  });
  // .use('/set', setRouter.routes(), setRouter.allowedMethods())
module.exports = experimentalRouter;