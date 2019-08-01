const Router = require('koa-router');
const baseRouter = new Router();
baseRouter
	.get('/', async (ctx, next) => {
		const {data} = ctx;
		data.type = 'base';
		ctx.template = 'experimental/settings/base.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		let {links, websiteName, github, copyright, record, description, keywords, brief, telephone} = body;
		if(!websiteName) ctx.throw(400, '网站名不能为空');
		websiteName = websiteName.trim();
		const serverSettings = await db.SettingModel.findOnly({_id: 'server'});
		const keywordsArr = keywords.split(',');
		const obj = {
		  c: {
        websiteName,
        github,
        copyright,
        record,
        description,
        keywords: keywordsArr,
        brief,
        telephone,
        links
      }
    };
		await serverSettings.update(obj);
		await db.SettingModel.saveSettingsToRedis("server");
		await next();
	});
module.exports = baseRouter;