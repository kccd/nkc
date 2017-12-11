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
    const indexOfPostId = await db.PostModel.find(q, {pid: 1, _id: 0}).sort({toc: 1});
    const indexArr = indexOfPostId.map(p => p.pid);
    const paging = apiFn.paging(page, indexOfPostId.length);
    data.paging = paging;
    const forum = await ForumModel.findOnly({fid: thread.fid});
    const {mid, toMid} = thread;
    const posts = await thread.getPostByQuery(query, q);
    posts.map(post => {
      const postContent = post.c || '';
      const index = postContent.indexOf('[quote=');
      if(index !== -1) {
        const targetPid = postContent.slice(postContent.indexOf(',')+1, postContent.indexOf(']'));
        const step = indexArr.indexOf(targetPid);
        const postIndex = indexArr.indexOf(targetPid);
        let page = Math.ceil(postIndex/paging.perpage);
        if(page <= 1) page = `?`;
        else page = `?page=${page - 1}`;
        const postLink = `/t/${tid + page}`;
        post.c = postContent.replace(/=/, `=${postLink}, ${step},`);
      }
    });
    data.posts = posts;
    await thread.extendFirstPost().then(p => p.extendUser());
    await thread.extendLastPost();
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
    data.targetUser = await thread.extendUser();
    await thread.update({$inc: {hits: 1}});
    data.thread = thread;
    data.forum = forum;
    data.replyTarget = `t/${tid}`;
    ctx.template = 'interface_thread.pug';
    await next();
  })
  .post('/:tid', async (ctx, next) => {
    const {
      data, params, db, body, ip,
      generateUsersBehavior
    } = ctx;
    const {user} = data;
    const {tid} = params;
    const {
      ThreadModel,
    } = db;
    const {post} = body;
    const thread = await ThreadModel.findOnly({tid});
    const _post = await thread.newPost(post, user, ip);
    data.targetUser = await thread.extendUser();
    await generateUsersBehavior({
      operation: 'postToThread',
      pid: _post.pid,
      tid: thread.tid,
      fid: thread.fid,
      mid: thread.mid,
      toMid: thread.toMid,
    });
    await thread.update({$inc: {count: 1}});
    const type = ctx.request.accepts('json', 'html');
    if(type === 'html')
      ctx.redirect(`/t/${tid}`, 303);
    await next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;
