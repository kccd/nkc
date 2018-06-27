const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.kcbSettings = await db.SettingModel.findOnly({type: 'kcb'});
		data.defaultUser = await db.UserModel.findOne({uid: data.kcbSettings.defaultUid});
		data.typesOfScoreChange = await db.TypesOfScoreChangeModel.find();
		ctx.template = 'experimental/settings/kcb.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		let {defaultUid, operation} = body;
		if(operation === 'saveKcbNumberSettings') {
			const {types} = body;
			for(const type of types) {
				let {count, change, _id} = type;
				count = parseInt(count);
				change = parseInt(change);
				const typeOfScoreChange = await db.TypesOfScoreChangeModel.findOnly({_id});
				if(count >= 0 || count === -1) {

				} else {
					ctx.throw(400, `${typeOfScoreChange.description}的次数设置错误`);
				}
				if(count === 0 || change < 0 || change > 0) {

				} else {
					ctx.throw(400, `${typeOfScoreChange.description}的科创币变化值设置错误`)
				}
				await typeOfScoreChange.update({count, change});
			}
		} else {
			const defaultUser = await db.UserModel.findOne({uid: defaultUid});
			if(!defaultUser) ctx.throw(400, '用户不存在');
			const kcbSettings = await db.SettingModel.findOnly({type: 'kcb'});
			await kcbSettings.update({defaultUid});
		}

		await next();
	});
module.exports = router;