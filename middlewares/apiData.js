module.exports = async (ctx, next) => {
  if(ctx.isAPIRoute) {
    ctx.apiData = {
      code: 1,
      type: 'OK',
      message: 'OK',
      data: ctx.apiData,
    }
  }
  await next();
}
