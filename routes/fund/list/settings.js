const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
	// 具体某个基金项目设置页面
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {fundId} = ctx.params;
		const fundCerts = [];
		const {certificates} = ctx.settings.permission;
		for (let cert in certificates) {
			fundCerts.push({
				cert: cert,
				displayName: certificates[cert].displayName
			});
		}
		data.fundCerts = fundCerts;
		data.fund = await db.FundModel.findOnly({_id: fundId.toUpperCase()});
		data.nav = '基金设置';
		ctx.template = 'interface_fund_setting.pug';
		await next();
	});
module.exports = settingsRouter;