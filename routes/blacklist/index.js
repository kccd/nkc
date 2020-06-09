const router = require("koa-router")();
router
  .get('/', async (ctx, next) => {
    const {query, data, db, state} = ctx;
    let {tUid, pid} = query;
    if(!tUid) {
      const post = await db.PostModel.findOnly({pid});
      tUid = post.uid;
    }
    const {user} = data;
    data.subscribed = state.subUsersId.includes(tUid);
    data.isFriend = !!(await db.FriendModel.findOne({uid: user.uid, tUid}));
    data.bl = await db.BlacklistModel.findOne({uid: user.uid, tUid});
    data.tbl = await db.BlacklistModel.findOne({uid: tUid, tUid: user.uid});
    data.blacklistInfo = await db.BlacklistModel.getBlacklistInfo(tUid, user.uid, ctx.permission('canSendToEveryOne'))
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, data, db} = ctx;
    const {tUid, from, pid} = body;
    const {user} = data;
    data.list = await db.BlacklistModel.addUserToBlacklist(user.uid, tUid, from, pid);
    await next();
  })
  .del('/', async (ctx, next) => {
    const {query, data, db} = ctx;
    const {user} = data;
    const {tUid} = query;
    await db.BlacklistModel.removeUserFromBlacklist(user.uid, tUid);
    await next();
  });
module.exports = router;
