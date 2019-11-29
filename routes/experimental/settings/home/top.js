const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		ctx.data.type = 'top';
		/*const {data, db} = ctx;
		
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		data.ads = [];
		for(const tid of homeSettings.c.ads) {
			const thread = await db.ThreadModel.findOne({tid});
			if(thread) {
				await thread.extendFirstPost().then(p => p.extendUser());
				if(thread.lm) {
					await thread.extendLastPost().then(p => p.extendUser());
				} else {
					thread.firstPost = thread.lastPost;
				}
				data.ads.push(thread);
			}
		}*/
		ctx.template = 'experimental/settings/home.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {ads, operation} = body;
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		if(operation === 'modifyOrder') {
			await homeSettings.update({'c.ads': ads});
		}
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	});
module.exports = router;
