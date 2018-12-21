const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.examSettings = (await db.SettingModel.findOnly({_id: 'exam'})).c;
		ctx.template = 'experimental/settings/exam.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		let {volumeAFailedPostCountOneDay} = body;
		volumeAFailedPostCountOneDay = parseInt(volumeAFailedPostCountOneDay);
		if(volumeAFailedPostCountOneDay < 0 && volumeAFailedPostCountOneDay !== -1) {
			ctx.throw(400, '回复数设置错误');
		}
		await db.SettingModel.update({_id: 'exam'}, {$set: {'c.volumeAFailedPostCountOneDay': volumeAFailedPostCountOneDay}});
		await next();
	});
module.exports = router;