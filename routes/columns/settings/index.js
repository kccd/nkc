const Router = require("koa-router");
const router = new Router();
const postRouter = require("./post");
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
  .use("/post", postRouter.routes(), postRouter.allowedMethods());
module.exports = router;
