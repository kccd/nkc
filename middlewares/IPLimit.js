// 限制 ip 访问
module.exports = async (ctx, next) => {
  const {nkcModules, address, settings} = ctx;
  const key = nkcModules.getRedisKeys('IPBlacklist');
  const isMember = await settings.redisClient.sismemberAsync(key, address);
  if(isMember) {
    ctx.status = 403;
    return ctx.body = `Forbidden`;
  }
  await next();
}