const Router = require('koa-router');
const homeTopRouter = new Router();
homeTopRouter
	.post('/', async (ctx, next) => {
		const {params, db} = ctx;
		const {tid} = params;
		const homeSettings = await db.SettingModel.getSettings("home");
		const {toppedThreadsId} = homeSettings;
		if(toppedThreadsId.includes(tid)) ctx.throw(400, "文章已经被推送到首页了");
		toppedThreadsId.unshift(tid);
		await db.SettingModel.updateOne({_id: "home"}, {
			$set: {
				"c.toppedThreadsId": toppedThreadsId
			}
		});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	})
	.del('/', async (ctx, next) => {
		const {params, db} = ctx;
		const {tid} = params;
		const homeSettings = await db.SettingModel.getSettings("home");
		const {toppedThreadsId} = homeSettings;
		if(!toppedThreadsId.includes(tid)) ctx.throw(400, "文章未被推送到首页");
		await db.SettingModel.updateOne({_id: "home"}, {
			$pull: {
				"c.toppedThreadsId": tid
			}
		});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	});
module.exports = homeTopRouter;