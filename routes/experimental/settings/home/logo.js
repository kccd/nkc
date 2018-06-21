const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.homeSettings = await db.SettingModel.findOnly({type: 'home'});
		ctx.template = 'experimental/settings/home.pug';
		data.type = 'logo';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {body, db} = ctx;
		const {id} = body;
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		if(homeSettings.logo === id) ctx.throw(400, '图片已被设置为默认logo');
		if(!homeSettings.logos.includes(id)) ctx.throw(400, '图片无效');
		await homeSettings.update({logo: id});
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, query} = ctx;
		const {id} = query;
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		if(homeSettings.logo === id) ctx.throw(400, '图片已被设置为默认logo，暂不能删除');
		if(!homeSettings.logos.includes(id)) ctx.throw(400, '图片无效');
		await homeSettings.update({$pull: {logos: id}});
		await next();
	});
module.exports = router;
