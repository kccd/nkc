const Router = require("koa-router");
const router = new Router();
const postRouter = require("./post");
const contributeRouter = require("./contribute");
const categoryRouter = require("./category");
router
  .use("/", async (ctx, next) => {
    const {user, column} = ctx.data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    await next();
  })
  .get("/", async (ctx, next) => {
    ctx.template = "columns/settings/info.pug";
    ctx.data.highlight = "info";
    await next();
  })
  .use("/contribute", contributeRouter.routes(), contributeRouter.allowedMethods())
  .use("/category", categoryRouter.routes(), categoryRouter.allowedMethods())
  .use("/post", postRouter.routes(), postRouter.allowedMethods());
module.exports = router;
