const {
  subscribeUserService,
} = require('../../../services/subscribe/subscribeUser.service');
module.exports = async (ctx, next) => {
  const { data, db, query } = ctx;
  const { user, targetUser } = data;
  const { page = 0 } = query;
  if (user) {
    if (user.uid === targetUser.uid) {
      await db.SubscribeModel.saveUserSubUsersId(user.uid);
    }
    data.userSubUid = await db.SubscribeModel.getUserSubUsersId(user.uid);
  }
  const { paging, users } = await subscribeUserService.getUserFollowers(
    targetUser.uid,
    page,
  );
  data.paging = paging;
  data.users = users;
  await next();
};
