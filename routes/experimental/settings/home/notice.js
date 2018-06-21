const Router = require('koa-router');
const router = new Router();
router
	.get('/', async  (ctx, next) => {
		const {data, db} = ctx;
		data.type = 'notice';
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		data.homeSettings = homeSettings;
		data.noticeThreads = [];
		if(homeSettings.noticeThreadsId && homeSettings.noticeThreadsId.length !== 0) {
			for(const oc of homeSettings.noticeThreadsId) {
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
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {id} = body;
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		const noticeThreadsId = [];
		for(const i of id) {
			if(!noticeThreadsId.includes(i)) {
				const thread = await db.ThreadModel.findOne({oc: i});
				if(thread) {
					noticeThreadsId.push(i);
				}
			}
		}
		await homeSettings.update({noticeThreadsId});
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, query} = ctx;
		const {oc} = query;
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		await homeSettings.update({$pull: {noticeThreadsId: oc}});
		await next();
	});
module.exports = router;