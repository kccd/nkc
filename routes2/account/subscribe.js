module.exports = {
  get: async (ctx, next) => {
    ctx.template = "account/subscribe/subscribe.pug";
    await next();
  }
};