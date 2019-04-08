const Router = require('koa-router');
const router = new Router();
const financeRouter = require('./finance');
router
  .use('/finance', financeRouter.routes(), financeRouter.allowedMethods());
module.exports = router;