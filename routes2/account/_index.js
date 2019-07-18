module.exports = {
  get: async (ctx, next) => {
    console.log("account home get");
    await next();
  }
};