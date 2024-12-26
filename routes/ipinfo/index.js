const Router = require('koa-router');

const ipinfoRouter = new Router();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
ipinfoRouter.get('/', OnlyOperation(Operations.ipinfo), async (ctx, next) => {
  const { db, address, data, query } = ctx;
  let { ip } = query;
  const realIp = await db.IPModel.getIPByToken(ip);
  if (realIp) {
    ip = realIp;
  }
  const targetIp = ip || address;
  // data.ipInfo = await db.IPModel.getIPInfoByIP(targetIp);
  data.ipInfo = await db.IPModel.getIPInfoFromLocal(targetIp);
  await next();
});

module.exports = ipinfoRouter;
