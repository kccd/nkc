const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.scoreSettings = (await db.SettingModel.findOnly({_id: 'score'})).c;
		ctx.template = 'experimental/settings/number.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {coefficients} = body;
		for(key in coefficients) {
			if(!coefficients.hasOwnProperty(key)) continue;
			coefficients[key] = parseFloat(coefficients[key]);
		}
		const scoreSettings = await db.SettingModel.findOnly({_id: 'score'});
		await scoreSettings.update({'c.coefficients': coefficients});
		await db.SettingModel.saveSettingsToRedis("score");
		await next();
	});
module.exports = router;