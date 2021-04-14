const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, data, body, params} = ctx;
    const {topped} = body;
    const {pid} = params;
    const {user} = data;
    const post = await db.PostModel.findOne({pid});
    if(post.parentPostId) ctx.throw(400, "评论内容无法置顶");
    const thread = await db.ThreadModel.findOne({tid: post.tid});
    if(thread.oc === post.pid) ctx.throw(400, "文章内容无法置顶");
    if(
      ctx.permission("topAllPost") ||
      (post.uid === user.uid && await db.PostModel.ensureToppingPermission(user.uid))
    ) {
      const toppedPostsId = thread.toppedPostsId;
      if(topped) {
        if(!toppedPostsId.includes(post.pid)) {
          toppedPostsId.unshift(post.pid);
        }
      } else {
        const index = toppedPostsId.indexOf(post.pid);
        if(index !== -1) {
          toppedPostsId.splice(index, 1);
        }
      }
      await thread.updateOne({
        toppedPostsId
      });
    } else {
      ctx.throw(403, "权限不足");
    }
    await next();
  });
module.exports = router;