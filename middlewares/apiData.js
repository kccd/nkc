module.exports = async (ctx, next) => {
  if (ctx.apiData !== null) {
    ctx.apiData = {
      code: 1,
      type: 'OK',
      message: 'OK',
      data: ctx.apiData,
    };
  }
  await next();
};
