const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {pid} = params;
    const post = await db.PostModel.findOne({pid});
    if(!post) ctx.throw(400, "未找到ID为${pid}的post");
    data.author = await db.UserModel.findOne({uid: post.uid});
    await next();
  });
module.exports = router;