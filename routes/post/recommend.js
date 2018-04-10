const Router = require('koa-router');
const router = new Router();

router
  .post('/', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const {user} = data;
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    const targetForum = await db.ForumModel.findOnly({fid: targetThread.fid});
    // if(!data.certificates.contentClasses.includes(targetForum.type)) ctx.throw(403,'权限不足');
    // if((targetThread.disabled || targetPost.disabled) && (!targetForum.moderators.includes(user.uid)) && ctx.userLevel <= 4) ctx.throw(403,'权限不足');
    if(!(await targetThread.ensurePermission(ctx))) ctx.throw(403,'权限不足');
    if(targetPost.disabled) ctx.throw(400, '无法推荐已经被禁用的回复');
    const personal = await db.PersonalForumModel.findOneAndUpdate({uid: user.uid}, {$addToSet: {recPosts: pid}});
    const post = await db.PostModel.findOneAndUpdate({pid}, {$addToSet: {recUsers: user.uid}});
    if(personal.recPosts.includes(pid) && post.recUsers.includes(user.uid))
      ctx.throw(400, '您已经推介过该post了,没有必要重复推介');
    data.targetUser = await post.extendUser();
    data.message = post.recUsers.length + 1;
    await ctx.generateUsersBehavior({
      operation: 'recommendPost',
      pid,
      tid: targetThread.tid,
      fid: targetThread.fid,
      toMid: targetThread.toMid,
      mid: targetThread.mid
    });
    await targetThread.updateThreadMessage();
    await next();
  })
  .del('/', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const {user} = data;
    const personal = await db.PersonalForumModel.findOneAndUpdate({uid: user.uid}, {$pull: {recPosts: pid}});
    const post = await db.PostModel.findOneAndUpdate({pid}, {$pull: {recUsers: user.uid}});
    const targetThread = await post.extendThread();
    if(!personal.recPosts.includes(pid) && !post.recUsers.includes(user.uid))
      ctx.throw(400, '您没有推介过该post了,没有必要取消推介');
    data.message = (post.recUsers.length > 0)?post.recUsers.length - 1: 0;
    data.targetUser = await post.extendUser();
    await ctx.generateUsersBehavior({
      operation: 'unrecommendPost',
      pid,
      tid: targetThread.tid,
      fid: targetThread.fid,
      toMid: targetThread.toMid,
      mid: targetThread.mid
    });
    await targetThread.updateThreadMessage();
    await next();
  });

module.exports = router;