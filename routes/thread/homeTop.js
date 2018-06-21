const Router = require('koa-router');
const homeTopRouter = new Router();
homeTopRouter
	.post('/', async (ctx, next) => {
		const {params, db} = ctx;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		if(homeSettings.ads.includes(thread.tid)) ctx.throw(400, '文章已被置顶');
		if(!thread.hasCover) ctx.throw(400, '文章没有封面图，暂不能在首页置顶显示');
		await homeSettings.update({$addToSet: {ads: thread.tid}});
		await next();
	})
	.del('/', async (ctx, next) => {
		const {params, db} = ctx;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		if(!homeSettings.ads.includes(thread.tid)) ctx.throw(400, '文章未被置顶');
		await homeSettings.update({$pull: {ads: thread.tid}});
		await next();
	});
module.exports = homeTopRouter;