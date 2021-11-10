module.exports = async (ctx, next) => {
  if(ctx.data.user) ctx.data.user = ctx.data.user.toObject();
  delete ctx.data.userGrade;
  delete ctx.data.userOperationsId;
  delete ctx.data.userRoles;
  ctx.logIt = true;
  ctx.type = 'json';
  ctx.body = ctx.data;
};