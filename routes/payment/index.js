const router = require('koa-router')();
const weChatRouter = require('./weChat');
const aliPayRouter = require('./alipay');
router
  .use('/wechat', weChatRouter.routes(), weChatRouter.allowedMethods())
  .use('/alipay', aliPayRouter.routes(), aliPayRouter.allowedMethods());
module.exports = router;
