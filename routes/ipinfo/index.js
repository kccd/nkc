const Router = require('koa-router');

const ipinfoRouter = new Router();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
const { ipFinderService } = require('../../services/ip/ipFinder.service');
ipinfoRouter.get('/', OnlyOperation(Operations.ipinfo), async (ctx, next) => {
  const { db, address, data, query } = ctx;
  let { ip } = query;
  const realIp = await ipFinderService.getIPByToken(ip);
  if (realIp) {
    ip = realIp;
  }
  const targetIp = ip || address;
  data.ipInfo = await ipFinderService.getIpInfo(targetIp);
  await next();
});

module.exports = ipinfoRouter;
