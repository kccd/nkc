const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.downloadSettings = (await db.SettingModel.findOnly({_id: 'download'})).c;
		ctx.template = 'experimental/settings/download.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const downloadSettings = await db.SettingModel.findOnly({_id: 'download'});
		if(body.operation === 'saveDownloadFile') {
			let {numberOfDays, numberOfKcb} = body;
			numberOfDays = parseInt(numberOfDays);
			numberOfKcb = parseInt(numberOfKcb);
			if (isNaN(numberOfKcb)) ctx.throw(400, '消耗科创币数输入错误');
			if (isNaN(numberOfDays)) ctx.throw(400, '收费天数输入错误');
			await downloadSettings.update({'c.numberOfDays': numberOfDays, 'c.numberOfKcb': numberOfKcb});
		}
		await next();
	});
module.exports = router;