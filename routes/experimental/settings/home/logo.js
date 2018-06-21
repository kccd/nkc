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
		const {id, type} = body;
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		const q = {};
		if(type === 'smallLogo') {
			if(homeSettings.smallLogo === id) ctx.throw(400, '图片已被设置为默认小图了');
			q.smallLogo = id;
		} else if(type === 'logo') {
			if(homeSettings.logo === id) ctx.throw(400, '图片已被设置为默认大图了');
			q.logo = id;
		} else {
			ctx.throw(400, '参数错误');
		}
		if(!homeSettings.logos.includes(id)) ctx.throw(400, '图片无效');
		await homeSettings.update(q);
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, query} = ctx;
		const {id} = query;
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		if(homeSettings.logo === id || homeSettings.smallLogo === id) ctx.throw(400, '暂不能删除默认图片');
		if(!homeSettings.logos.includes(id)) ctx.throw(400, '图片无效');
		await homeSettings.update({$pull: {logos: id}});
		await next();
	});
module.exports = router;
