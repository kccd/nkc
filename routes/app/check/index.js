const Router = require('koa-router');
const checkRouter = new Router();
checkRouter
	.get('/', async (ctx, next) => {
    const {data, db, query, params} = ctx;
    // 获取最新版本
    const {sysType} = query;
    var queryMap = {
      "appPlatForm": sysType,
      latest: true
    }
    if(sysType) {
      const latestVer = await db.AppVersionModel.findOne(queryMap);
      if(latestVer){
        data.latestVer = latestVer;
      }
    }
		await next();
	});
module.exports = checkRouter;