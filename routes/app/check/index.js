const Router = require('koa-router');
const config = require('../../../config/server.json');
const checkRouter = new Router();
checkRouter
  .get('/', async (ctx, next) => {
    const { data, db, query } = ctx;
    // 获取最新版本
    const { systemType } = query;
    var queryMap = {
      "appPlatForm": systemType,
      stable: true,
      canDown: true
    };
    if (systemType) {
      let latestVer = await db.AppVersionModel.findOne(queryMap);
      if (latestVer) {
        let newVersion = latestVer.toObject();
        newVersion.url = config.domain + config.port + '/app/' + newVersion.appPlatForm + '/' + newVersion.hash;
        data.newVersion = newVersion;
      };
    };
    await next();
  });
module.exports = checkRouter;
