const router  = require('koa-router')();

router.get('/', async (ctx, next) => {
  const {query, data, db} = ctx;
  const {uid} = query;
  const {user} = data;

  data.targetUser = await db.UserModel.findOne({uid});

  const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
  if(friend) ctx.throw(400, `该用户已是你的好友，请勿重复添加。`);

  ctx.template = 'message/appAddFriend/appAddFriend.pug'

  await next();
});

module.exports = router;
