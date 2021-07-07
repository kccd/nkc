const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {nkcModules, query, db, data} = ctx;
    const {page = 0} = query;
    const count = await db.UsersCodeLogModel.countDocuments({});
    const paging = nkcModules.apiFunction.paging(page, count, 2);
    const usersCodeLogs = await db.UsersCodeLogModel.find({}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const usersId = [];
    for(const log of usersCodeLogs) {
      const {uid, mUid} = log;
      if(uid) usersId.push(uid);
      if(mUid) usersId.push(mUid);
    }
    const users = await db.UserModel.find({uid: {$in: usersId}}, {uid: 1, username: 1, avatar: 1});
    const usersObj = {};
    users.map(u => usersObj[u.uid] = u);
    data.usersCodeLogs = [];
    for(let log of usersCodeLogs) {
      log = log.toObject();
      if(log.uid) log.user = usersObj[log.uid];
      if(log.mUid) log.mUser = usersObj[log.mUid];
      data.usersCodeLogs.push(log);
    }
    data.paging = paging;
    ctx.template = 'experimental/log/userCode.pug';
    await next();
  });
module.exports = router;