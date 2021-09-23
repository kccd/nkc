const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data, query, params} = ctx;
    const {pid} = params;
    let {t, d} = query;
    t = t || d;
    if(!await db.PostModel.ensureAttachmentPermission(data.user?data.user.uid: ""))
      ctx.throw(400, "权限不足");
    const q = {};
    switch(t) {
      case "attachment":
        q.mediaType = "mediaAttachment";
        break;
      case "video":
        q.mediaType = "mediaVideo";
        break;
      case "audio":
        q.mediaType = "mediaAudio";
        break;
      case "picture":
        q.mediaType = "mediaPicture";
    }
    const post = await db.PostModel.findOnly({pid});
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
    let postsId;
    if(post.pid === thread.oc) {
      const posts = await db.PostModel.find({tid: thread.tid}, {pid: 1});
      postsId = posts.map(post => post.pid);
    } else {
      postsId = [pid];
    }
    q.references = {$in: postsId};
    const resources = await db.ResourceModel.find(q).sort({toc: 1});
    const usersId = resources.map(r => r.uid);
    const users = await db.UserModel.find({uid: {$in: usersId}});
    const usersObj = {};
    for(const user of users) {
      usersObj[user.uid] = user;
    }
    data.resources = [];
    for(const r of resources) {
      const resource = r.toObject();
      resource.user = usersObj[resource.uid];
      data.resources.push(resource);
    }
    if(data.user) {
      if(ctx.permission("modifyAllResource")) {
        data.createFilePermission = true;
      } else {
        const permissions = await db.LibraryModel.getPermission(data.user);
        data.createFilePermission = permissions.includes("createFile");
      }
    }
    await next();
  });
module.exports = router;