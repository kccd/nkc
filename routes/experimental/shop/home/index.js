const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data} = ctx;
		ctx.template = 'experimental/shop/home.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		let {websiteName, github, copyright, record, description, keywords, brief, telephone} = body;
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
        telephone
      }
    };
		await serverSettings.update(obj);
		await next();
	});
module.exports = homeRouter;