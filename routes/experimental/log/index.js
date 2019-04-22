const Router = require('koa-router');
const logRouter = new Router();
const publicRouter = require('./public');
const infoRouter = require('./info');
const secretRouter = require('./secret');
const experimentalRouter = require('./experimental');
const behaviorRouter = require('./behavior');
const scoreRouter = require('./score');
const kcbRouter = require('./kcb');
const xsfRouter = require('./xsf');
const rechargeRouter = require("./recharge");
const withdrawRouter = require("./withdraw");
const examRouter = require("./exam");
logRouter
  .get('/', async (ctx, next) => {
    return ctx.redirect(`/e/log/public`);
  })
  .use("/exam", examRouter.routes(), examRouter.allowedMethods())
  .use("/withdraw", withdrawRouter.routes(), withdrawRouter.allowedMethods())
  .use("/recharge", rechargeRouter.routes(), rechargeRouter.allowedMethods())
  .use('/xsf', xsfRouter.routes(), xsfRouter.allowedMethods())
  .use('/kcb', kcbRouter.routes(), kcbRouter.allowedMethods())
  .use('/public', publicRouter.routes(), publicRouter.allowedMethods())
  .use('/info', infoRouter.routes(), infoRouter.allowedMethods())
  .use('/experimental', experimentalRouter.routes(), experimentalRouter.allowedMethods())
  .use('/secret', secretRouter.routes(), secretRouter.allowedMethods())
  .use('/behavior', behaviorRouter.routes(), behaviorRouter.allowedMethods())
  .use('/score', scoreRouter.routes(), scoreRouter.allowedMethods());
module.exports = logRouter;