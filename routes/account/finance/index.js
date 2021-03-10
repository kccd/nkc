const Router = require('koa-router');
const router = new Router();
const rechargeRouter = require('./recharge');
const withdrawRouter = require('./withdraw');
const exchangeRouter = require('./exchange');
router
  .use('/recharge', rechargeRouter.routes(), rechargeRouter.allowedMethods())
  .use('/exchange', exchangeRouter.routes(), exchangeRouter.allowedMethods())
  .use('/withdraw', withdrawRouter.routes(), withdrawRouter.allowedMethods());
module.exports = router;
