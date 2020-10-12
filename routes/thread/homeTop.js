const Router = require('koa-router');
const homeTopRouter = new Router();
homeTopRouter
	.use('/', async (ctx, next) => {
		const {body, query, data} = ctx;
		const latest = body.latest || query.latest;
		data.valueName = latest? 'latestToppedThreadsId': 'toppedThreadsId';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {params, db, data} = ctx;
		const {tid} = params;
		const {valueName} = data;
		const obj = {};
		obj[`c.${valueName}`] = tid;
		await db.SettingModel.updateOne({_id: "home"}, {
			$addToSet: obj
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
