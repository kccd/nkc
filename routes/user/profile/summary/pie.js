module.exports = async (ctx, next) => {
  const {db, data} = ctx;
  const {targetUser} = data;
  data.pie = await db.UserModel.getUserPostSummary(targetUser.uid);
  await next();
};