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
    let { systemType, sysType, version} = query;
    if(!systemType) systemType = sysType;
    if (systemType) {
      const queryMap = {
        appPlatForm: systemType,
        stable: true,
        disabled: false
      };
      const latestVer = await db.AppVersionModel.findOne(queryMap);
      if (latestVer) {
        const newVersion = latestVer.toObject();
        newVersion.url = config.domain + ":" + config.port + '/app/' + newVersion.appPlatForm + '/' + newVersion.hash;
        if(version && version !== newVersion.appVersion) {
          data.newVersion = newVersion;
        }
        data.latestVer = newVersion; // 兼容旧版APP的下载链接 2020-1-18，APP更新多个版本后可移除
      }
    }
    await next();
  });
module.exports = checkRouter;
