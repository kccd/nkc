const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;

threadRouter
  .get('/:tid', async (ctx, next) => {
    const {data, params, db, query} = ctx;
    let {page = 0, pid, last_page, highlight} = query;
    const {tid} = params;
    const {
      ThreadModel,
      PersonalForumModel,
      SettingModel,
      ForumModel,
      PostModel
    } = db;
    const thread = await ThreadModel.findOnly({tid});
    if(!await thread.ensurePermission(ctx)) ctx.throw('401', '权限不足');
    let q = {
      tid: tid
    };
    data.highlight = highlight;
    if(!await thread.ensurePermissionOfModerators(ctx)) q.disabled = false;
    data.paging = apiFn.paging(page, thread.count);
    const forum = await ForumModel.findOnly({fid: thread.fid});
    const {mid, toMid} = thread;
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
    let posts;
    if(pid) {
      const matchBase = ctx.generateMatchBase({pid}).toJS();
      const {page, step} = await thread.getStep(matchBase);
      return ctx.redirect(`/t/${tid}?&page=${page}&highlight=${pid}#${pid}`, 301)
    } else if(last_page) {
      query.page = data.paging.pageCount - 1;
      data.paging.page = data.paging.pageCount - 1;
      posts = await thread.getPostByQuery(query, q);
    } else {
      posts = await thread.getPostByQuery(query, q);
    }
    await Promise.all(posts.map(async post => {
      const postContent = post.c || '';
      const index = postContent.indexOf('[quote=');
      if(index !== -1) {
        const targetPid = postContent.slice(postContent.indexOf(',')+1, postContent.indexOf(']'));
        let {page, step} = await thread.getStep({pid: targetPid, disabled: q.disabled});
        page = `?page=${page}`;
        const postLink = `/t/${tid + page}`;
        post.c = postContent.replace(/=/,`=${postLink},${step},`);
      }
    }));
    data.posts = posts;
    await thread.extendFirstPost().then(p => p.extendUser());
    await thread.extendLastPost();
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
    if(post.c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
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
    await thread.update({$inc: [{count: 1}, {hits: 1}]});
    const type = ctx.request.accepts('json', 'html');
    await thread.updateThreadMessage();
    await user.updateUserMessage();
    if(type === 'html')
      ctx.redirect(`/t/${tid}`, 303);
    await next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;
