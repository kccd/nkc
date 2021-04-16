const Router = require("koa-router");
const router = new Router();
router
  .put("/", async (ctx, next) => {
    const {db, body, params, data} = ctx;
    const {pid} = params;
    const {user} = data;
    const {hide} = body;
    const post = await db.PostModel.findOnly({pid});
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
    if(!await db.PostModel.ensureHidePostPermission(thread, user)) {
      ctx.throw(403, "权限不足");
    }
    if(!["null", "half", "all", "not"].includes(hide)) ctx.throw(400, "未知的折叠类型");
    await post.updateOne({hide});
    await next();
  });
module.exports = router;
