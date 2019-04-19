const Router = require('koa-router');
const authRouter = new Router();
authRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		ctx.template = "experimental/shop/auth.pug";
		let banList = [];
		const shopSetting = await db.ShopSettingsModel.findOne({type: "homeSetting"});
		if(shopSetting.banList) banList = shopSetting.banList;
		const banUsers = await db.UserModel.find({uid: banList});
		data.banUsers = banUsers;
		await next();
	})
	.post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
		const {sign} = body;
		// 查找用户是否存在
		const user = await db.UserModel.findOne({uid:sign});
		if(!user) ctx.throw(400, "用户不存在,请检查uid是否正确");
		const shopSetting = await db.ShopSettingsModel.findOne({type: "homeSetting"});
		let banList = [];
		if(shopSetting.banList) banList = shopSetting.banList;
		if(banList.indexOf(sign) > -1) ctx.throw(400, "该用户已在封禁名单中")
		banList.push(sign);
		await shopSetting.update({$set:{banList:banList}});
		await next();
	})
	.patch('/delban', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {uid} = body;
		const shopSetting = await db.ShopSettingsModel.findOne({type: "homeSetting"});
		let banList = [];
		if(shopSetting.banList) banList = shopSetting.banList;
		const signIndex = banList.indexOf(uid);
		if(signIndex == -1) {
			ctx.throw(400, "该用户已解禁");
		}else{
			banList.splice(signIndex, 1);
		}
		await shopSetting.update({$set:{banList: banList}});
		await next();
	})
module.exports = authRouter;