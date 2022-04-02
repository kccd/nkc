module.exports = async (ctx, next) => {
  const {data, db} = ctx;
  const {targetUser} = data;
  const sub = await db.SubscribeModel.find({
    type: "user",
    cancel: false,
    tUid: targetUser.uid,
  }, {uid: 1}).sort({toc: -1}).limit(9);
  const targetUserFans = await db.UserModel.find({
    uid: {
      $in: sub.map(s => s.uid)
    }
  });
  data.targetUserFans = await db.UserModel.extendUsersInfo(targetUserFans);
  await next();
}
