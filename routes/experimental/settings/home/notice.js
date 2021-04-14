const Router = require('koa-router');
const router = new Router();
router
	.get('/', async  (ctx, next) => {
		const {data, db} = ctx;
		data.type = 'notice';
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		data.homeSettings = homeSettings.c;
		data.noticeThreads = [];
		if(homeSettings.c.noticeThreadsId && homeSettings.c.noticeThreadsId.length !== 0) {
			for(const oc of homeSettings.c.noticeThreadsId) {
				const thread = await db.ThreadModel.findOne({oc});
				if(thread) {
					await thread.extendFirstPost();
					data.noticeThreads.push(thread);
				}
			}
		}
		ctx.template = 'experimental/settings/home.pug';
		await next();
	})
	.put('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {id} = body;
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		const noticeThreadsId = [];
		for(const i of id) {
			if(!noticeThreadsId.includes(i)) {
				const thread = await db.ThreadModel.findOne({oc: i});
				if(thread) {
					noticeThreadsId.push(i);
				}
			}
		}
		await homeSettings.updateOne({'c.noticeThreadsId': noticeThreadsId});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, query} = ctx;
		const {oc} = query;
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		await homeSettings.updateOne({$pull: {'c.noticeThreadsId': oc}});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	});
module.exports = router;
