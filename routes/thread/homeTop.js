const Router = require('koa-router');
const homeTopRouter = new Router();
homeTopRouter
	.use('/', async (ctx, next) => {
		const {body, query, data} = ctx;
    const type = body.type || query.type;
    if(type === 'latest') {
      data.valueName = 'latestToppedThreadsId';
    } else if(type === 'community') {
      data.valueName = 'communityToppedThreadsId';
    } else {
      data.valueName = 'toppedThreadsId';
    }
		await next();
	})
	.post('/', async (ctx, next) => {
		const {params, db, data} = ctx;
		const {tid} = params;
		const {valueName} = data;
		const obj = {};
		const homeSettings = await db.SettingModel.getSettings('home');
		const threadsId = homeSettings[valueName];
		if(!threadsId.includes(tid)) threadsId.unshift(tid);
		obj[`c.${valueName}`] = threadsId;
		await db.SettingModel.updateOne({_id: "home"}, {
			$set: obj
		});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	})
	.del('/', async (ctx, next) => {
		const {params, db, data} = ctx;
		const {tid} = params;
		const {valueName} = data;
		const obj = {};
		obj[`c.${valueName}`] = tid;
		await db.SettingModel.updateOne({_id: "home"}, {
			$pull: obj
		});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	});
module.exports = homeTopRouter;
