const Router = require('koa-router');
const router = new Router();
const financeRouter = require('./finance');
const contributeRouter = require("./contribute");
router
  .use("/contribute", contributeRouter.routes(), contributeRouter.allowedMethods())
  .use('/finance', financeRouter.routes(), financeRouter.allowedMethods());
module.exports = router;