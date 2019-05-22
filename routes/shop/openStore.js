const Router = require('koa-router');
const openStoreRouter = new Router();
openStoreRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
    const applyHis = await db.ShopApplyStoreModel.findOne({uid:user.uid}).sort({submitApplyToc:-1});
    data.applyHis = applyHis;
		ctx.template = 'shop/openStore/index.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, params} = ctx;
    const {user} = data;
		if(!user) ctx.throw(403, "游客暂无开店权限");
		// 获取身份认证等级
		const userPersonal = await db.UsersPersonalModel.findOne({uid:user.uid});
		const userAuth = await userPersonal.getAuthLevel();
		const homeSetting = await db.ShopSettingsModel.findOne({type:"homeSetting"});
		if(userAuth < homeSetting.authLevel) ctx.throw(400, `交易权限需通过身份认证${homeSetting.authLevel}`)
    let applyStoreInfo = {
      uid: user.uid,
      username: user.username
    }
		const newApply = new db.ShopApplyStoreModel(applyStoreInfo);
		newApply.save();
		await next();
	})
module.exports = openStoreRouter;