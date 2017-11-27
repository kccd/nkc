const Router = require('koa-router');
const operationRouter = require('./operation');
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    const type = ctx.request.accepts('json', 'html');
    const {data} = ctx;
    const {user} = data;
    if(type === 'json') {
      if(!user) ctx.throw(401, '未登录用户不能发帖');
      data.forumsList = await dbFn.getAvailableForums(ctx);
      data.uid = user.uid;
    } else {
      ctx.throw(404);
    }
    await next();
  })
  .get('/:fid', async (ctx, next) => {
    const {ForumModel, ThreadTypeModel, UserModel} = ctx.db;
    const {fid} = ctx.params;
    const {data, query} = ctx;
    const {digest, cat, sortby} = query;
    const page = query.page || 0;
    const visibleFid = await ctx.getVisibleFid();
    const forum = await ForumModel.findOnly({fid});
    if(!forum.ensurePermission(visibleFid)) ctx.throw(401, '权限不足');
    const fidOfChildForum = await forum.getFidOfChildForum(visibleFid);
    let q = {
      fid: {$in: fidOfChildForum}
    };
    if(cat) q.cid = cat;
    if(digest) {
      q.digest = true;
      data.digest = true;
    }
    const countOfThread = await forum.getThreadCountByQuery(q);
    const paging = apiFn.paging(page, countOfThread);
    data.cat = cat;
    data.sortby = sortby;
    data.paging = paging;
    data.forum = forum;
    if(forum.moderators.length > 0) data.moderators = await UserModel.find({uid: {$in: forum.moderators}});
    let threads = await forum.getThreadsByQuery(query, q);
    let toppedThreads = [];
    if(data.paging.page === 0 && data.forum.type === 'forum') {
      toppedThreads = await forum.getToppedThreads(fidOfChildForum);
    }
    const forumList = await dbFn.getAvailableForums(ctx);
    data.toppedThreads = toppedThreads;
    data.threads = threads;
    data.forumList = forumList;
    data.forums = [];
    for (let i = 0; i < forumList.length; i++) {
      if(forumList[i].fid === fid) {
        data.forums = forumList[i].children;
        break;
      }
    }
    data.replyTarget = `f/${fid}`;
    const thredTypes = await ThreadTypeModel.find().sort({order: 1});
    let forumThreadTypes = [];
    for (let i = 0; i < thredTypes.length; i++) {
      if(thredTypes[i].fid === fid) forumThreadTypes.push(thredTypes[i]);
    }
    data.threadTypes = thredTypes;
    data.forumThreadTypes = forumThreadTypes;
    data.fTarget = fid;
    if(data.user) {
      data.userThreads = await data.user.getUsersThreads();
    }
    ctx.template = 'interface_forum.pug';
    await next();
  })
  .use('/:fid', operationRouter.routes(), operationRouter.allowedMethods());

module.exports = forumRouter;