const Router = require('koa-router');

const ipinfoRouter = new Router();
ipinfoRouter
  .get("/", async (ctx, next) => {
    let { db, address, nkcModules, query } = ctx;
    let { ip } = query;
    const realIp = await db.IPModel.getIPByToken(ip);
    if(realIp) ip = realIp;
    let targetIp = ip || address;
    let ipInfo = await nkcModules.apiFunction.getIpAddress(targetIp);
    ipInfo.ip = targetIp;
    ctx.data.ipInfo = ipInfo;
    await next();
  });


module.exports = ipinfoRouter;
