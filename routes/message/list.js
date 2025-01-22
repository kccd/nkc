const router = require('koa-router')();
const { OnlyUnbannedUser, OnlyUser } = require('../../middlewares/permission');
router.get('/', OnlyUser(), async (ctx, next) => {
  const { db, data, nkcModules } = ctx;
  const { user } = data;
  data.chatList = await db.CreatedChatModel.getCreatedChat(user.uid);
  data.userList = await db.FriendModel.getFriends(user.uid);
  data.categoryList = await db.FriendsCategoryModel.getCategories(user.uid);
  data.mUser = {
    uid: user.uid,
    bannerUrl: nkcModules.tools.getUrl('userBanner', user.banner),
    avatarUrl: nkcModules.tools.getUrl('userAvatar', user.avatar),
    name: user.name,
  };
  await next();
});
module.exports = router;
