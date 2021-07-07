const Router = require('koa-router');
const logRouter = new Router();
const publicRouter = require('./public');
const secretRouter = require('./secret');
const experimentalRouter = require('./experimental');
const behaviorRouter = require('./behavior');
const scoreRouter = require('./score');
const kcbRouter = require('./kcb');
const xsfRouter = require('./xsf');
const rechargeRouter = require("./recharge");
const withdrawRouter = require("./withdraw");
const examRouter = require("./exam");
const recycleRouter = require("./recycle");
const reviewRouter = require("./review");
const warningRouter = require("./warning");
const shareRouter = require("./share");
const shopRouter = require("./shop");
const messageRouter = require("./message");
const smscodeRouter = require("./smscode");
const emailcodeRouter = require("./emailcode");
const blacklistRouter = require("./blacklist");
const resourceRouter = require('./resource');
const userCodeRouter = require('./userCode');
logRouter
  .get('/', async (ctx, next) => {
    const {nkcModules} =ctx;
    return ctx.redirect(`/e/log/public`);
  })
  .use("/exam", examRouter.routes(), examRouter.allowedMethods())
  .use("/withdraw", withdrawRouter.routes(), withdrawRouter.allowedMethods())
  .use("/recharge", rechargeRouter.routes(), rechargeRouter.allowedMethods())
  .use('/xsf', xsfRouter.routes(), xsfRouter.allowedMethods())
  .use('/kcb', kcbRouter.routes(), kcbRouter.allowedMethods())
  .use('/public', publicRouter.routes(), publicRouter.allowedMethods())
  .use('/experimental', experimentalRouter.routes(), experimentalRouter.allowedMethods())
  .use('/recycle', recycleRouter.routes(), recycleRouter.allowedMethods())
  .use('/secret', secretRouter.routes(), secretRouter.allowedMethods())
  .use("/warning", warningRouter.routes(), warningRouter.allowedMethods())
  .use('/behavior', behaviorRouter.routes(), behaviorRouter.allowedMethods())
  .use("/review", reviewRouter.routes(), reviewRouter.allowedMethods())
  .use('/share', shareRouter.routes(), shareRouter.allowedMethods())
  .use("/shop", shopRouter.routes(), shopRouter.allowedMethods())
  .use("/message", messageRouter.routes(), messageRouter.allowedMethods())
  .use('/score', scoreRouter.routes(), scoreRouter.allowedMethods())
  .use("/smscode", smscodeRouter.routes(), smscodeRouter.allowedMethods())
  .use("/emailcode", emailcodeRouter.routes(), emailcodeRouter.allowedMethods())
  .use("/blacklist", blacklistRouter.routes(), blacklistRouter.allowedMethods())
  .use("/userCode", userCodeRouter.routes(), userCodeRouter.allowedMethods())
  .use('/resource', resourceRouter.routes(), resourceRouter.allowedMethods())
module.exports = logRouter;
