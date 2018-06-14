const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.kcbSettings = await db.SettingModel.findOnly({type: 'kcb'});
		ctx.template = 'experimental/settings/kcb.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		let {defaultUid} = body;
		const defaultUser = await db.UserModel.findOne({uid: defaultUid});
		if(!defaultUser) ctx.throw(400, '默认账户不存在');
		const kcbSettings = await db.SettingModel.findOnly({type: 'kcb'});
		await kcbSettings.update({defaultUid});
		await next();
	});
module.exports = router;