const Router = require("koa-router");
const router = new Router();
const moveRouter = require("./move");
const recycleRouter = require("./recycle");
const draftRouter = require("./draft");
router
  .use("/draft", draftRouter.routes(), draftRouter.allowedMethods())
  .use("/recycle", recycleRouter.routes(), recycleRouter.allowedMethods())
  .use("/move", moveRouter.routes(), moveRouter.allowedMethods());
module.exports = router;