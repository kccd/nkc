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
		const fundSettings = await db.SettingModel.findOne({type: 'fund'});
		const {settingsObj} = body;
		settingsObj.closed.uid = user.uid;
		settingsObj.closed.username = user.username;
		if(!fundSettings.closed.status && settingsObj.closed.status) {
			settingsObj.closed.closingTime = Date.now();
		} else {
			settingsObj.closed.closingTime = fundSettings.closed.closingTime;
		}
		await fundSettings.update({$set: settingsObj});
		await next();
	});
module.exports = settingsRouter;