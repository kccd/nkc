const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, body, params, data} = ctx;
    const {pid} = params;
    const {anonymous} = body;
    const post = await db.PostModel.findOnly({pid});
    if(anonymous) {
      if(post.anonymous) ctx.throw(400, "作者已经匿名了，请刷新");
    } else {
      if(!post.anonymous) ctx.throw(400, "作者尚未匿名，请刷新");
    }
    await post.update({anonymous: !!anonymous});
    data.anonymous = !!anonymous;
    await next();
  });
module.exports = router;
