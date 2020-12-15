const Router = require("koa-router");
const Path = require("path");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, db, data, params} = ctx;
    const {pid} = params;
    data.post = await db.PostModel.findOnly({pid});
    let comments = await db.PostModel.find({
      parentPostsId: pid
    }, {
      pid: 1,
      parentPostId: 1
    }).sort({toc: 1});
    const pidArr = new Set();
    for(const p of comments) {
      pidArr.add(p.pid);
      if(p.parentPostId !== pid) pidArr.add(p.parentPostId);
    }
    let posts = await db.PostModel.find({pid: {$in: [...pidArr]}});
    posts = await db.PostModel.extendPosts(posts, {
      uid: data.user? data.user.uid: "",
      visitor: data.user
    });
    const postsObj = {};
    posts = posts.map(post => {
      post.posts = [];
      post.parentPost = "";
      postsObj[post.pid] = post;
      return post;
    });

    const topPosts = [];

    for(const post of posts) {
      if(post.parentPostId === pid) {
        // post.parentPost = postsObj[post.parentPostId];
        topPosts.push(post);
        continue;
      }
      const parent = postsObj[post.parentPostId];
      if(parent) {
        post.parentPost = {
          user: parent.user,
          pid: parent.pid,
          uid: parent.uid,
          tid: parent.tid
        };
        parent.posts.push(post);
      }
    }
    data.posts = topPosts;
    data.modifyPostTimeLimit = await db.UserModel.getModifyPostTimeLimit(data.user);
    const template = Path.resolve("./pages/thread/comments.pug");
    data.html = nkcModules.render(template, data, ctx.state);
    await next();
  });
module.exports = router;
