const {
  subscribeUserService,
} = require('../../../services/subscribe/subscribeUser.service');
module.exports = async (ctx, next) => {
  const { data, db, state, query } = ctx;
  const { targetUser, user } = data;
  const { page = 0 } = query;
  if (user) {
    if (user.uid === targetUser.uid) {
      await db.SubscribeModel.saveUserFansId(state.uid);
    }
    data.userSubUid = await db.SubscribeModel.getUserSubUsersId(user.uid);
  }
  const { paging, users } = await subscribeUserService.getUserFans(
    targetUser.uid,
    page,
  );
  data.paging = paging;
  data.users = users;
  await next();
};
