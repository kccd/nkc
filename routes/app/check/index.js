const Router = require('koa-router');
const config = require('../../../config/server.json');
const checkRouter = new Router();
const { appStores } = require('../../../settings/app');
checkRouter.get('/', async (ctx, next) => {
  const { data, db, query, state } = ctx;
  /*
    此处为了兼容旧版APP，新平台不再需要
    if(ctx.req.headers.cookie) {
      data.cookie = Buffer.from(ctx.req.headers.cookie).toString('base64');
    }
    */
  let { systemType, sysType, version } = query;
  if (!systemType) {
    systemType = sysType;
  }
  if (systemType) {
    const queryMap = {
      appPlatForm: systemType,
      stable: true,
      disabled: false,
    };
    const latestVer = await db.AppVersionModel.findOne(queryMap);
    if (latestVer) {
      const newVersion = latestVer.toObject();
      newVersion.url =
        config.domain +
        '/app/' +
        newVersion.appPlatForm +
        '/' +
        newVersion.hash +
        '?t=' +
        Date.now();
      newVersion.googlePlay = latestVer.appStores.includes(
        appStores.GooglePlay,
      );
      newVersion.appStore = latestVer.appStores.includes(appStores.iOSAPPStore);
      if (version && version !== newVersion.appVersion) {
        const parts1 = newVersion.appVersion.split('.').map(Number);
        const parts2 = version.split('.').map(Number);
        let isNewVersion = false;
        for (let i = 0; i < 3; i++) {
          if (parts1[i] > parts2[i]) {
            isNewVersion = true;
            break;
          } else if (parts1[i] < parts2[i]) {
            break;
          }
        }
        data.newVersion = isNewVersion ? newVersion : null;
      }
      data.latestVer = newVersion; // 兼容旧版APP的下载链接 2020-1-18，APP更新多个版本后可移除
    }
  }

  /*
   * app检测服务器地址是否正常工作
   * 服务器收到请求后会将query中的origin原样返回给app
   * */
  const { origin } = query;
  data.origin = origin;

  await next();
});
module.exports = checkRouter;
