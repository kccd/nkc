const Router = require('koa-router');
const config = require('../../../config/server.json');
const checkRouter = new Router();
checkRouter
  .get('/', async (ctx, next) => {
    const { data, db, query } = ctx;
    if(ctx.req.headers.cookie) {
      data.cookie = Buffer.from(ctx.req.headers.cookie).toString('base64');
    }
    // 获取最新版本
    const { systemType } = query;
    var queryMap = {
      appPlatForm: systemType,
      stable: true,
      disabled: false
    };
    if (systemType) {
      const latestVer = await db.AppVersionModel.findOne(queryMap);
      if (latestVer) {
        const newVersion = latestVer.toObject();
        newVersion.url = config.domain + ":" + config.port + '/app/' + newVersion.appPlatForm + '/' + newVersion.hash;
        data.newVersion = newVersion;
      }
    }
    await next();
  });
module.exports = checkRouter;
