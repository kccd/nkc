const Router = require("koa-router");
const router = new Router();
const moveRouter = require("./move");
const recycleRouter = require("./recycle");
const draftRouter = require("./draft");
const unblockRouter = require("./unblock");
router
  .use("/draft", draftRouter.routes(), draftRouter.allowedMethods())
  .use("/recycle", recycleRouter.routes(), recycleRouter.allowedMethods())
  .use("/unblock", unblockRouter.routes(), unblockRouter.allowedMethods())
  .use("/move", moveRouter.routes(), moveRouter.allowedMethods());
module.exports = router;