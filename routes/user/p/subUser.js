module.exports = async (ctx, next) => {
  //获取用户个人主页的粉丝和关注
  const {data, db} = ctx;
  const {user, targetUser} = data;
  const sub = await db.SubscribeModel.find({
    type: "user",
    cancel: false,
    uid: targetUser.uid
  }, {tUid: 1}).sort({toc: -1}).limit(9);
  const targetUserFollowers = await db.UserModel.find({
    uid: {
      $in: sub.map(s => s.tUid)
    }
  });
  const fans = await db.SubscribeModel.find({
    type: "user",
    cancel: false,
    tUid: targetUser.uid,
  }, {uid: 1}).sort({toc: -1}).limit(9);
  const targetUserFans = await db.UserModel.find({
    uid: {
      $in: fans.map(s => s.uid)
    }
  });
  const fansCount = targetUserFans.length
  const followersCount = targetUserFollowers.length
  data.fansCount = fansCount;
  data.followersCount = followersCount;
  data.targetUserFans = await db.UserModel.extendUsersInfo(targetUserFans);
  data.targetUserFollowers = await db.UserModel.extendUsersInfo(targetUserFollowers);
  await next();
}
