const Router = require('koa-router');
const smsRouter = new Router();
smsRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.smsSettings = (await db.SettingModel.findOnly({_id: 'sms'})).c;
		ctx.template = 'experimental/settings/sms.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body, data} = ctx;
		const settings = {
			login: body.login,
			register: body.register,
			changeMobile: body.changeMobile,
			bindMobile: body.bindMobile,
			getback: body.getback
		};
		for(const key in settings) {
			if(!settings.hasOwnProperty(key)) continue;
			const setting = settings[key];
			if(setting.validityPeriod < 0) setting.validityPeriod = 0;
			if(setting.sameMobileOneDay < 0) setting.sameMobileOneDay = 0;
			if(setting.sameIpOneDay < 0) setting.sameIpOneDay = 0;
			setting.validityPeriod = parseInt(setting.validityPeriod);
			setting.sameMobileOneDay = parseInt(setting.sameMobileOneDay);
			setting.sameIpOneDay = parseInt(setting.sameIpOneDay);
		}
		const smsSettings = await db.SettingModel.findOnly({_id: 'sms'});
		await smsSettings.update({c: settings});
		await next();
	});
module.exports = smsRouter;