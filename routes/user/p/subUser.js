module.exports = async (ctx, next) => {
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
  data.targetUserFollowers = await db.UserModel.extendUsersInfo(targetUserFollowers);
  await next();
}
