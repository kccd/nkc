const Router = require('koa-router');
const operationRouter = require('./operation');
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    ctx.data.forums = await ctx.nkcModules.dbFunction.getAvailableForums(ctx);
    await next()
  })
  .get('/:fid', async (ctx, next) => {
    const {ForumModel, ThreadTypeModel, UserModel} = ctx.db;
    const {fid} = ctx.params;
    const {digest, cat, sortby} = ctx.query;
    const data = ctx.data;
    let page = ctx.query.page || 0;
    let countOfThread = await ThreadTypeModel.count({fid});
    let paging = apiFn.paging(page, countOfThread);
    ctx.template = 'interface_forum.pug';
    if(digest) data.digest = true;
    data.cat = cat;
    data.sortby = sortby;
    data.paging = paging;
    const {query} = ctx;
    const forum = await ForumModel.findOne({fid});
    data.forum = forum;
    if(forum.moderators.length > 0) data.moderators = await UserModel.find({uid: {$in: forum.moderators}});
    let threads = await forum.getThreadsByQuery(query);
    for (let i = 0; i < threads.length; i++) {
      threads[i].oc.user.navbarDesc = ctx.getUserDescription(threads[i].oc.user);
      console.log(`-------------${threads[i].oc.user.uid}-------------------`);
      console.log(threads[i].oc.user.navbarDesc);
    }
    let toppedThreads = [];
    if(data.paging.page === 0 && data.forum.type === 'forum') {
      toppedThreads = await dbFn.getToppedThreads(fid);
      for(let i = 0; i < toppedThreads.length; i++) {
        toppedThreads[i].oc.user.navbarDesc = ctx.getUserDescription(toppedThreads[i].oc.user);
      }
    }
    data.toppedThreads = toppedThreads;
    data.threads = threads;
    let forumList = await dbFn.getAvailableForums(ctx);
    data.forumList = forumList;
    data.forums = [];
    for (let i = 0; i < forumList.length; i++) {
      if(forumList[i].fid === fid) {
        data.forums = forumList[i].children;
        break;
      }
    }
    data.replyTarget = `f/${fid}`;
    const thredTypes = await ThreadTypeModel.find();
    let forumThreadTypes = [];
    for (let i = 0; i < thredTypes.length; i++) {
      if(thredTypes[i].fid === fid) forumThreadTypes.push(thredTypes[i]);
    }
    data.threadTypes = thredTypes;
    data.forumThreadTypes = forumThreadTypes;
    data.fTarget = fid;
    if(data.user)
      data.userThreads = await data.user.getUsersThreads();
    await next()
  })
  .use('/:fid', operationRouter.routes(), operationRouter.allowedMethods());

module.exports = forumRouter;