const Router = require('koa-router');
const baseRouter = new Router();
baseRouter
	.get('/', async (ctx, next) => {
		const {data} = ctx;
		data.type = 'base';
		ctx.template = 'experimental/settings/base.pug';
		await next();
	})
	.put('/', async (ctx, next) => {
		const {db, body} = ctx;
		let {links, websiteName, websiteAbbr, github, backgroundColor, copyright, record, description, keywords, brief, telephone, statement} = body;
		if(!websiteName) ctx.throw(400, '网站名不能为空');
		websiteName = websiteName.trim();
		const serverSettings = await db.SettingModel.findOnly({_id: 'server'});
		const keywordsArr = keywords.split(',');
		const obj = {
		  c: {
				websiteName,
				websiteAbbr,
        github,
				backgroundColor,
        copyright,
        record,
			  statement,
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
	})
	.post('/siteicon', async (ctx, next) => {
		let {body, db, data} = ctx;
		let {AttachmentModel} = db;
		let {icon} = body.files;
		let attachment = await AttachmentModel.saveSiteIcon(icon);
		data.aid = attachment._id;
		return next();
	});
module.exports = baseRouter;
