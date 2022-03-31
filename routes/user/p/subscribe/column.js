module.exports = async (ctx, next) => {
  //获取用户关注的专栏
  const {db, data, state, params} = ctx;
  const {uid} = params;
  await next();
};
