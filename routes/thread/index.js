const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;


threadRouter
  .post('/:tid', async (ctx, next) => {
    const tid = ctx.params.tid;
    await next();
  })
  .get('/:tid', async (ctx, next) => {
    const {data, params, db, query} = ctx;
    const {tid} = params;
    const {
      ThreadModel,
      PersonalForumModel,
      ForumModel,
      UserModel,
      PostModel,
      SettingModel
    } = db;
    ctx.template = 'interface_thread.pug';
    let thread = await ThreadModel.findOnly({tid});
    const {mid, toMid} = thread;
    data.posts = await thread.getPostsByQuery(query, {tid});
    thread = thread.toObject();
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
    await next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;