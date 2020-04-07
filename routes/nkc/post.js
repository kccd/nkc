const router = require("koa-router")();
router
  .get("/", async(ctx, next) => {
    // 将最新的post直接渲染到页面上
    const {data, db, query, nkcModules} = ctx;
    const {page = 0} = query;
    const count = await db.PostModel.count();
    const paging = nkcModules.apiFunction.paging(page, count, 50);
    let posts = await db.PostModel.find({})
      .sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    posts = await db.PostModel.extendPosts(posts, {

    });
    data.posts = posts;
    ctx.template = "nkc/post/post.pug";
    await next();
  });
module.exports = router;