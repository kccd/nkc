const Router = require('koa-router');
const baseRouter = new Router();
baseRouter
	.get('/', async (ctx, next) => {
		const {data} = ctx;
		data.type = 'base';
		ctx.template = 'experimental/index.pug';
		ctx.localTemplate = 'experimental/settings/base.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		let {websiteName, github, copyright, record, description, keywords, brief, telephone} = body;
		if(!websiteName) ctx.throw(400, '网站名不能为空');
		websiteName = websiteName.trim();
		const serverSettings = await db.SettingModel.findOnly({type: 'server'});
		const keywordsArr = keywords.split(',');
		await serverSettings.update({websiteName, github, copyright, record, description,keywords: keywordsArr, brief, telephone});
		global.NKC.serverSettings = await db.SettingModel.findOnly({type: 'server'});
		await next();
	});
module.exports = baseRouter;