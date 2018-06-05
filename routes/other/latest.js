const Router = require('koa-router');
const latestRouter = new Router();
const nkcModules = require('../../nkcModules');
const apiFn = nkcModules.apiFunction;
const dbFn = nkcModules.dbFunction;
latestRouter
  .get('/', async (ctx, next) => {
    const { data, db, query } = ctx;
    const accessibleFid = await ctx.getThreadListFid(); // 拿到能在主页显示帖子的fid
    const { digest, sortby } = query;
    if (data.userLevel === -1) {
      ctx.throw(403, '您的账号已被封禁，请退出登录后重新注册。');
    }
    const page = query.page || 0;
    const q = {
      fid: { $in: accessibleFid }
    };
    if (digest === 'true') q.digest = true;
    const threadCount = await db.ThreadModel.count(q);
    let { $skip, $limit, $match, $sort } = apiFn.getQueryObj(query, q);
    // // 主页过滤掉退回标记的帖子
    // $match.recycleMark = {"$nin":[true]}
    data.paging = apiFn.paging(page, threadCount);
    // 删除退修过时的帖子
    // 取出全部被标记的帖子
    const allMarkthreads = await db.ThreadModel.find({ "recycleMark": true, "fid": { "$nin": ["recycle"] } })
    for (var i in allMarkthreads) {
      const delThreadLog = await db.DelPostLogModel.find({ "postType": "thread", "threadId": allMarkthreads[i].tid }).sort({ toc: -1 })
      if (delThreadLog.length > 0) {
        if (delThreadLog[0].modifyType === false) {
          let sysTimeStamp = new Date(delThreadLog[0].toc).getTime()
          let nowTimeStamp = new Date().getTime()
          let diffTimeStamp = parseInt(nowTimeStamp) - parseInt(sysTimeStamp)
          let hourTimeStamp = 3600000 * 72;
          let lastTimestamp = parseInt(new Date(delThreadLog[0].toc).getTime()) + hourTimeStamp;
          if (diffTimeStamp > hourTimeStamp) {
            await allMarkthreads[i].update({ "recycleMark": false, fid: "recycle" })
          }
        }
      } else {
        await allMarkthreads[i].update({ "recycleMark": false, fid: "recycle" })
      }
    }
    const threads1 = await db.ThreadModel.find($match).sort($sort).skip($skip).limit($limit);
    const threads = [];

    if (ctx.data.userLevel > 5) {
      for (let i in threads1) {
        threads.push(threads1[i])
      }
    } else if (ctx.data.userLevel <= 0) {
      for (let i in threads1) {
        if (threads1[i].recycleMark === true) {
          continue;
        }
        threads.push(threads1[i])
      }
    } else {
      for (let i in threads1) {
        if (threads1[i].uid !== ctx.data.user.uid && threads1[i].recycleMark === true) {
          continue;
        }
        threads.push(threads1[i])
      }
    }

    /*if(ctx.data.userLevel === 0){
      for(var i in threads1){
        if(threads1[i].recycleMark === true){
          continue;
        }
        threads.push(threads1[i])
      }
    }else{
      for(var i in threads1){
        if(threads1[i].uid !== ctx.data.user.uid && threads1[i].recycleMark === true){
          continue;
        }
        threads.push(threads1[i])
      }
    }*/


    for (let i = 0; i < threads.length; i++) {
      const t = threads[i];
      await t.extendFirstPost().then(p => p.extendUser());
      await t.firstPost.extendResources();
      await t.extendLastPost();
      if (t.lastPost) {
        await t.lastPost.extendUser();
      } else {
        threads.splice(i, 1);
      }
      await t.extendForum();
      await t.forum.extendParentForum();
    }

    data.indexThreads = threads;
    data.forumList = await dbFn.getAvailableForums(ctx);
    data.digest = digest;
    data.sortby = sortby;
    data.navbar = { highlight: 'latest' };
    data.content = 'forum';
    if (data.user)
      data.userThreads = await data.user.getUsersThreads();
    const { home } = ctx.settings;
    const activeUsers = await db.ActiveUserModel.find().sort({ vitality: -1 }).limit(home.activeUsersLength);
    await Promise.all(activeUsers.map(activeUser => activeUser.extendUser()));
    data.activeUsers = activeUsers;
    ctx.template = 'interface_latest_threads.pug';
    await next()
  });

module.exports = latestRouter;