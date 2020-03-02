const router = require("koa-router")();
router
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {postsId} = body;
    const {user} = data;
    for(const postId of postsId) {
      const post = await db.PostModel.findOne({pid: postId});
      if(!post) ctx.throw(400, `未找到ID为${postId}的post`);
      const thread = await db.ThreadModel.findOne({tid: post.tid});
      if(!thread) ctx.throw(400, `未找到ID为${post.tid}的thread`);
      let type = thread.oc === postId? "thread": "post";
      if(type === "thread") continue;
      const isModerator = ctx.permission("superModerator") || await thread.isModerator(user, "or");
      if(!isModerator) ctx.throw(403, `您没有权限处理ID为${postId}的post`);
      if(!post.disabled) ctx.throw(400, `ID为${post.pid}的回复未被屏蔽，请刷新`);
      await post.update({disabled: false, toDraft: null});
      const delPostLog = await db.DelPostLogModel.find({postId: post.pid, modifyType: false});
      for(const log of delPostLog) {
        await log.update({modifyType: true});
      }
    }
    await next();
  });
module.exports = router;