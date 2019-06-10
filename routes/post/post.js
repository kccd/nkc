const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, db, data, params} = ctx;
    const {pid} = params;
    const perpage = 30;
    const count = await db.PostModel.count({parentPostId: pid});
    const posts = await db.PostModel.find({
      parentPostId: pid
    }).sort({toc: 1});
    data.posts = await db.PostModel.extendPosts(posts);
    await next();
  });
module.exports = router;