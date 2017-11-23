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
      SettingModel,
      ForumModel
    } = db;
    const thread = await ThreadModel.findOnly({tid});
    if(!await thread.ensurePermission(ctx)) ctx.throw('401', '权限不足');
    const q = {
      tid: tid
    };
    if(!await thread.ensurePermissionOfModerators(ctx)) q.disabled = false;
    const indexOfPostId = await db.PostModel.find(q, {pid: 1}).sort({toc: 1});
    const indexArr = indexOfPostId.map(p => p.pid);
    data.paging = apiFn.paging(page, indexOfPostId.length);
    const forum = await ForumModel.findOnly({fid: thread.fid});
    const {mid, toMid} = thread;
    let posts = await thread.getPostByQuery(query, q);
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
