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
    let postOfTargetThread = await PostModel.find({tid}, {pid: 1}).sort({toc: 1});
    data.paging = apiFn.paging(page, postOfTargetThread.length);
    console.log(`查找总数耗时: ${Date.now()-t} ms`);
    ctx.template = 'interface_thread.pug';
    t = Date.now();
    let thread = await ThreadModel.findOnly({tid});
    console.log(`查找目标帖子耗时: ${Date.now()-t} ms`);
    const {mid, toMid} = thread;
    t = Date.now();
    // let posts = await PostModel.aggregate([
    //   {$match: {tid}},
    //   {$sort: {toc: 1}},
    //   {$lookup: {
    //     from: 'users',
    //     localField: 'uid',
    //     foreignField: 'uid',
    //     as: 'user'
    //   }},
    //   {$unwind: '$user'}
    // ]);
    let posts = await PostModel.find({tid}).sort({toc: 1});
    posts = await Promise.all(posts.map(p => p.extendUser()));
    console.log(posts);
    console.log(`查找目标post耗时: ${Date.now()-t} ms`);
    t = Date.now();
    let indexArr = [];
    for (let i = 0; i < postOfTargetThread.length; i++) {
      indexArr.push(postOfTargetThread[i].pid);
    }
    for (let i = 0; i < posts.length; i++) {
      let postContent = posts[i].c || '';
      let index = postContent.indexOf('[quote=');
      if(index !== -1){
        let targetPid = postContent.slice(postContent.indexOf(',')+1, postContent.indexOf(']'));
        let step = indexArr.indexOf(targetPid);
        posts[i].c = postContent.replace(/=/, `=${step},`);
      }
    }
    console.log(`算回复楼层: ${Date.now()-t} ms`);
    data.posts = posts;
    /*let indexArr = await PostModel.find({tid}, {pid: 1, id: 0}).sort({toc: 1});
    let posts = await thread.getPostsByQuery(query, {tid});
    for (let i = 0; i < posts.length; i++) {
      posts[i] = posts[i].toObject();
      let postContent = posts[i].c;
      if(postContent.indexOf('[quote=') !== -1){
        let targetPid = postContent.slice(postContent.indexOf(',')+1, postContent.indexOf(']'));

      }
    }*/
    thread = thread.toObject();
    t = Date.now();
    thread.oc = await PostModel.findOnly({pid: thread.oc});
    let ocuser = (await UserModel.findOnly({uid: thread.uid})).toObject();
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
    data.targetUser = dbFn.findUserByTid(tid);
    data.replyTarget = `t/${tid}`;
    console.log(`其他耗时: ${Date.now()-t} ms`);
    await next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;