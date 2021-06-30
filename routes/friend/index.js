const Router = require('koa-router');
const router = new Router();
const imageRouter = require('./image');
router
  .use('/:uid/image', imageRouter.routes(), imageRouter.allowedMethods());
module.exports = router;