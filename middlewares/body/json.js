module.exports = async (ctx) => {
  if(ctx.data.user) ctx.data.user = ctx.data.user.toObject();
  delete ctx.data.userGrade;
  delete ctx.data.userOperationsId;
  delete ctx.data.userRoles;
  ctx.logIt = true;
  ctx.type = 'json';

  // 为了兼容旧路由，这里需要判断请求路径
  if(ctx.isAPIRoute) {
    ctx.body = ctx.apiData;
  } else {
    ctx.body = ctx.data;
  }
};
