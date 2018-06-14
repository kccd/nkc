const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
	// 具体某个基金项目设置页面
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {fundId} = ctx.params;
		data.roles = await db.RoleModel.find().sort({toc: 1});
		data.fund = await db.FundModel.findOnly({_id: fundId.toUpperCase()});
		data.nav = '基金设置';
		ctx.template = 'interface_fund_setting.pug';
		await next();
	});
module.exports = settingsRouter;