const router = require('koa-router')();
const cardRouter = require('./card');
const infoRouter = require('./info');
const drawerRouter = require('./drawer');
router
  .use('/drawer', drawerRouter.routes(), drawerRouter.allowedMethods())
  .use('/card', cardRouter.routes(), cardRouter.allowedMethods())
  .use('/info', infoRouter.routes(), infoRouter.allowedMethods());
module.exports = router;
