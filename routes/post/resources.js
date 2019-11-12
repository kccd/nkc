const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data, query, params} = ctx;
    const {pid} = params;
    const {t} = query;
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
    await next();
  });
module.exports = router;