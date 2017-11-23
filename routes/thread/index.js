const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;

threadRouter
  .get('/:tid', async (ctx, next) => {
    const {data, params, db, query} = ctx;
    const page = query.page || 0;
    const {tid} = params;
    const {
      ThreadModel,
      PersonalForumModel,
      PostModel,
      SettingModel,
      ForumModel
    } = db;
    const thread = await ThreadModel.findOnly({tid});
    const visibleFid = await ctx.getVisibleFid();
    const indexOfPostId = await thread.getIndexOfPostId();
    const indexArr = indexOfPostId.map(p => p.pid);
    data.paging = apiFn.paging(page, indexOfPostId.length);
    const forum = await ForumModel.findOnly({fid: thread.fid});
    const {mid, toMid} = thread;
    if(!thread.ensurePermission(visibleFid)) ctx.throw('401', '权限不足');
    if(thread.disabled && data.userLevel < 4) ctx.throw('401', '您没有权限查看已被屏蔽的帖子');
    let posts = await thread.getPostByQuery(query);
    posts.map(post => {
      post.user = post.user.toObject();
      post.user.navbarDesc = ctx.getUserDescription(post.user);
      const postContent = post.c || '';
      const index = postContent.indexOf('[quote=');
      if(index !== -1) {
        const targetPid = postContent.slice(postContent.indexOf(',')+1, postContent.indexOf(']'));
        const step = indexArr.indexOf(targetPid);
        post.c = postContent.replace(/=/, `=${step},`);
      }
    });
    data.posts = posts;
    let targetThread = await thread.extend();
    targetThread.oc.user.navbarDesc = ctx.getUserDescription(targetThread.oc.user);
    data.forumList = await dbFn.getAvailableForums(ctx);
    if(data.user) {
      data.usersThreads = await data.user.getUsersThreads();
    }
    data.ads = (await SettingModel.findOnly({uid: 'system'})).ads;
    let myForum, othersForum;
    if(mid !== '') {
      myForum = await PersonalForumModel.findOnly({uid: mid});
      data.myForum = myForum
    }
    if(toMid !== '') {
      othersForum = await PersonalForumModel.findOnly({uid: toMid});
      data.othersForum = othersForum
    }
    data.targetUser = await thread.getUser();
    data.thread = targetThread;
    data.forum = forum;
    data.replyTarget = `t/${tid}`;
    ctx.template = 'interface_thread.pug';
    await next();
  })
.use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;
