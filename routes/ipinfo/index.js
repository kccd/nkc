const Router = require('koa-router');

const ipinfoRouter = new Router();
ipinfoRouter
  .get("/", async (ctx, next) => {
    let { address, nkcModules, query } = ctx;
    let { ip } = query;
    let targetIp = ip || address;
    let ipInfo = await nkcModules.apiFunction.getIpAddress(targetIp);
    ipInfo.ip = targetIp;
    ctx.data.ipInfo = ipInfo;
    await next();
  });


module.exports = ipinfoRouter;