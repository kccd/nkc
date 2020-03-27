const Router = require('koa-router');
const router = new Router();

router
  .get("/", async (ctx, next) => {
    const {params, db, data, nkcModules} = ctx;
    const targetPost = await db.PostModel.findOnly({pid: params.pid});
    await targetPost.extendUser();
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    await targetThread.extendForums(['mainForums', 'minorForums']);
    await targetThread.ensurePermission(data.userRoles, data.userGrade, data.user);
    if(targetPost.disabled) ctx.throw(403, '无法引用已经被禁用的回复');
    if(!targetPost.reviewed) ctx.throw(403, "回复未通过审核，暂无法引用");
    let username, uid;
    let postsId = await db.PostModel.find({tid: targetPost.tid}, {pid: 1}).sort({toc: 1});
    postsId = postsId.map(p => p.pid);
    if(targetPost.anonymous) {
      username = "匿名用户";
    } else {
      username = targetPost.user.username;
      uid = targetPost.uid;
    }
    data.quotePost = {
      username,
      uid,
      pid: targetPost.pid,
      step: postsId.indexOf(targetPost.pid),
      c: nkcModules.nkcRender.HTMLToPlain(targetPost.c, 50)
    };
    await next();
  });

module.exports = router;