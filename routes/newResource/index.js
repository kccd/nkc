const Router = require("koa-router");
const router = new Router();
const coverRouter = require("./cover");
router
  .use("/cover", coverRouter.routes(), coverRouter.allowedMethods());
module.exports = router;