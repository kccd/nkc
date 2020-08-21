const Router = require('koa-router');
const router = new Router();
const rechargeRouter = require('./recharge');
const withdrawRouter = require('./withdraw');
router
  .use('/recharge', rechargeRouter.routes(), rechargeRouter.allowedMethods())
  .use('/withdraw', withdrawRouter.routes(), withdrawRouter.allowedMethods());
module.exports = router;
