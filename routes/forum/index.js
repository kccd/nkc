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
    const data = ctx.data;
    let page = ctx.query.page || 0;
    let paging = apiFn.paging(page, 1000);
    ctx.template = 'interface_forum.pug';
    const {fid, digest, cat, sortby} = ctx.params;
    if(digest) data.digest = true;
    data.cat = cat;
    data.sortby = sortby;
    data.paging = paging;
    const {ForumModel, ThreadTypeModel, UserModel} = ctx.db;
    const {query} = ctx;
    const forum = await ForumModel.findOne({fid});
    data.forum = forum;
    let uidObj = [];
    for (let uid of forum.moderators) {
      uidObj.push({uid});
    }
    if(uidObj.length > 0) data.moderators = await UserModel.find().or(uidObj);
    const threads = await forum.getThreadsByQuery({$match: {fid}});
    if(data.paging.page === 0 && data.forum.type === 'forum') {
      data.toppedThreads = await dbFn.getToppedThreads(fid);
    }
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
    console.log(data.toppedThreads[0])
    console.log(data.threads[0])
    if(data.user)
      data.userThreads = await data.user.getUsersThreads();
    await next()
  })
  .use('/:fid', operationRouter.routes(), operationRouter.allowedMethods());

module.exports = forumRouter;