const router = require('koa-router')();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router.get(
  '/',
  OnlyOperation(Operations.getMomentIpInfo),
  async (ctx, next) => {
    const { db, data, params, query, state, permission } = ctx;
    const { mid } = params;
    const moment = await db.MomentModel.findOnly({ _id: mid });
    if (!moment) {
      ctx.throw(400, '未找到动态，请刷新');
    }
    //权限判断
    const { stable: stableType } = await db.DocumentModel.getDocumentTypes();
    const { moment: momentSource } =
      await db.DocumentModel.getDocumentSources();
    const document = await db.DocumentModel.findOnly({
      did: moment.did,
      type: stableType,
      source: momentSource,
    });
    if (!document) {
      return ctx.throw(404, '未找到文章，请刷新后重试');
    }
    // if (!permission('review')) {
    //   ctx.throw(401, '权限不足');
    // }
    let ip = document.ip;
    let address = document.address;
    const realIp = await db.IPModel.getIPByToken(ip);
    if (realIp) {
      ip = realIp;
    }
    const targetIp = ip || address;
    data.ipInfo = await db.IPModel.getIPInfoFromLocal(targetIp);
    await next();
  },
);
module.exports = router;
