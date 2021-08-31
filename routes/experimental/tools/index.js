const router = require('koa-router')();
const filterRouter = require('./filter');
router
  .use('/filter', filterRouter.routes(), filterRouter.allowedMethods());
module.exports = router;