const router = require("koa-router")();
router
  .get('/', async (ctx, next) => {
    //获取该用户在黑名单中的的信息
    const {query, data, db, state} = ctx;
    let {tUid, pid, cid} = query; // tUid 被拉黑的用户 pid => postId cid => commentId
    if(!tUid) {
      if(pid) {
        const post = await db.PostModel.findOnly({pid});
        tUid = post.uid;
      } else if(cid) {
        const comment = await db.CommentModel.findOnly({_id: cid});
        tUid = comment.uid;
      }
    }
    const {user} = data;
    const subscribeUsersId = await db.SubscribeModel.getUserSubUsersId(data.user.uid);
    data.subscribed = subscribeUsersId.includes(tUid);
    data.isFriend = !!(await db.FriendModel.findOne({uid: user.uid, tUid}));
    data.bl = await db.BlacklistModel.findOne({uid: user.uid, tUid});
    data.tbl = await db.BlacklistModel.findOne({uid: tUid, tUid: user.uid});
    data.blacklistInfo = await db.BlacklistModel.getBlacklistInfo(tUid, user.uid, ctx.permission('canSendToEveryOne'))
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, data, db} = ctx;
    const {tUid, from, pid, cid, aid} = body;
    const {user} = data;
    await db.BlacklistModel.addUserToBlacklist(user.uid, tUid, from, pid, cid, aid);
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
