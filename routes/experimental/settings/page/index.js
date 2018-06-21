const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.pageSettings = await db.SettingModel.findOnly({type: 'page'});
		ctx.template = 'experimental/settings/page.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const pageSettings = await db.SettingModel.findOnly({type: 'page'});
		let {homeThreadsFirstLoad} = body;
		homeThreadsFirstLoad = parseInt(homeThreadsFirstLoad);
		if(homeThreadsFirstLoad > 0) {

		} else {
			ctx.throw(400, '参数错误');
		}
		await pageSettings.update({homeThreadsFirstLoad});
		await next();
	});
module.exports = router;
