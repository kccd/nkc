const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, body, params} = ctx;
    const {pid} = params;
    const post = await db.PostModel.findOnly({pid});
    const {type} = body;
    if(!["none", "part", "all"].includes(type)) ctx.throw(400, "未知的折叠类型");
    await post.update({hide: type});
    await next();
  });
module.exports = router;