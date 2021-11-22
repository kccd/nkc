module.exports = async (ctx, next) => {
  ctx.data = {};
  ctx.body = ctx.request.body;
  Object.assign(ctx.body, ctx.query || {});
  await next();
}