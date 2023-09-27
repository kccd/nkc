const router = require('koa-router')();
const cardRouter = require('./card');
const infoRouter = require('./info');
const drawerRouter = require('./drawer');
const permissionRouter = require('./permission');
router
  .use('/drawer', drawerRouter.routes(), drawerRouter.allowedMethods())
  .use('/card', cardRouter.routes(), cardRouter.allowedMethods())
  .use(
    '/permission',
    permissionRouter.routes(),
    permissionRouter.allowedMethods(),
  )
  .use('/info', infoRouter.routes(), infoRouter.allowedMethods());
module.exports = router;
