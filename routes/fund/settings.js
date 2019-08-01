const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_fund_general_settings.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user} = data;
		const fundSettings = await db.SettingModel.findOne({_id: 'fund'});
		const {settingsObj} = body;
		settingsObj.closed.uid = user.uid;
		settingsObj.closed.username = user.username;
		if(!fundSettings.c.closed.status && settingsObj.closed.status) {
			settingsObj.closed.closingTime = Date.now();
		} else {
			settingsObj.closed.closingTime = fundSettings.c.closed.closingTime;
		}
		const obj = {
		  c: settingsObj
    };
		await fundSettings.update({$set: obj});
		await db.SettingModel.saveSettingsToRedis("fund");
		await next();
	});
module.exports = settingsRouter;