const nkcModules = require("../nkcModules");
const body = require("./body");
module.exports = async (ctx, next) => {
  try{
    ctx.data.operationId = nkcModules.permission.getOperationId(ctx.url, ctx.method);
  } catch(err) {
    if(err.status === 404) {
      console.log(`未知请求：${ctx.address} ${ctx.method} ${ctx.url}`.bgRed);
      ctx.template = "error/error.pug";
      ctx.status = 404;
      ctx.data.status = 404;
      ctx.data.url = ctx.url;
      await body(ctx, () => {});
    } else {
      console.log(err);
    }
    return;
  }
  await next();
}