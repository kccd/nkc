const Router = require('koa-router');

const ipinfoRouter = new Router();
ipinfoRouter
  .get("/", async (ctx, next) => {
    const {db, address, data, query} = ctx;
    let {ip} = query;
    const realIp = await db.IPModel.getIPByToken(ip);
    if(realIp) ip = realIp;
    const targetIp = ip || address;
    data.ipInfo = await db.IPModel.getIPInfoByIP(targetIp);
    await next();
  });


module.exports = ipinfoRouter;
