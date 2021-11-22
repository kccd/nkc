module.exports = async (ctx, next) => {
  const {data} = ctx;
  ctx.body = data;
  ctx.type = 'json';
  await next();
}