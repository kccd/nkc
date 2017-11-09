const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;


// const {
//   postToThread,
//   postToForum,
//   disablePost,
//   enablePost,
//   recommendPost,
//   unrecommendPost,
//   subscribeUser,
//   unsubscribeUser,
//   setDigest,
//   cancelDigest,
//   setTopped,
//   cancelTopped
// } = settings.user.scoreMap;


threadRouter
  .post('/:tid', async (ctx, next) => {
    const tid = ctx.params.tid;
    await next();
  })
  .get('/:tid', async (ctx, next) => {
    const {data, params, db, query} = ctx;
    let page = query.page || 0;
    const {tid} = params;
    const {
      ThreadModel,
      PersonalForumModel,
      ForumModel,
      UserModel,
      PostModel,
      SettingModel,
    } = db;
    let t;
    t = Date.now();
    let postLength = await PostModel.count({tid});
    data.paging = apiFn.paging(page, postLength);
    console.log(`查找总数耗时: ${Date.now()-t} ms`);
    ctx.template = 'interface_thread.pug';
    t = Date.now();
    let thread = await ThreadModel.findOnly({tid});
    console.log(`查找目标帖子耗时: ${Date.now()-t} ms`);
    const {mid, toMid} = thread;
    t = Date.now();
    data.posts = await thread.getPostsByQuery(query, {tid});
    console.log(`查找目标post耗时: ${Date.now()-t} ms`);
    thread = thread.toObject();
    t = Date.now();
    thread.oc = await PostModel.findOnly({pid: thread.oc});
    let ocuser = (await UserModel.findOnly({uid: data.posts[0].uid})).toObject();
    ocuser.navbarDesc = ctx.getUserDescription(ocuser);
    data.ocuser = ocuser;
    data.forumList = await dbFn.getAvailableForums(ctx);
    if(data.user)
      data.usersThreads = await data.user.getUsersThreads();
    data.thread = thread;
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
    data.forum = await ForumModel.findOnly({fid: thread.fid});
    console.log(`其他耗时: ${Date.now()-t} ms`);
    await next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;