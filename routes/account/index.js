const Router = require('koa-router');
const router = new Router();
const financeRouter = require('./finance');
const contributeRouter = require("./contribute");
const subscribeReouter = require("./subscribes");
const subTypesRouter = require("./subscribeTypes");
router
  .use("/subscribe_types", subTypesRouter.routes(), subTypesRouter.allowedMethods())
  .use("/subscribes", subscribeReouter.routes(), subscribeReouter.allowedMethods())
  .use("/contribute", contributeRouter.routes(), contributeRouter.allowedMethods())
  .use('/finance', financeRouter.routes(), financeRouter.allowedMethods());
module.exports = router;