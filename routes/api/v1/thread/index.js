const Router = require('koa-router');
const router = new Router();
const orderRouter = require('./order');

router.use('/order', orderRouter.routes(), orderRouter.allowedMethods());

module.exports = router;
