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
		let {AttachmentModel} = db;
		let {fields, files} = body;
		let {siteIcon, links,websiteCode ,websiteName, websiteAbbr, github, backgroundColor, copyright, record, description, keywords, brief, telephone, statement} = JSON.parse(fields['settings']);
		let {siteicon} = files;
		if(!websiteName) ctx.throw(400, '网站名不能为空');
		if(!websiteCode) ctx.throw(400, `网站代号不能为空`);
		websiteName = websiteName.trim();
		const serverSettings = await db.SettingModel.findOnly({_id: 'server'});
		const keywordsArr = keywords.split(',');
		const obj = {
			c: {
				websiteCode,
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
				links,
				siteIcon: siteIcon
			}
		};
		if(siteicon) {
			const attachment = await AttachmentModel.saveSiteIcon(siteicon);
			obj.c.siteIcon = attachment._id;
		}
		await serverSettings.update(obj);
		await db.SettingModel.saveSettingsToRedis("server");
		await next();
	});
module.exports = baseRouter;
