const Router = require('koa-router');
const applysRouter = new Router();
applysRouter
	.get('/', async (ctx, next) => {
    const {data, db} = ctx;
		// 取出待处理的退款申请
		const refunds = await db.ShopRefundModel.find({root: true}).sort({toc:-1});
		data.refunds = refunds;
		ctx.template = "experimental/shop/refunds.pug"
		await next();
	})
	.post('/approve', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {id} = body;
		const {user} = data;
		const apply = await db.ShopApplyStoreModel.findOne({_id:id});
		if(!apply) ctx.throw(404, "找不到申请");
		let nowStamp = new Date();
		await apply.update({$set:{applyStatus: "approve", dealApplyToc:nowStamp, dealUid:user.uid}});
		const storeId = await db.SettingModel.operateSystemID('stores', 1);
		const userPersonal = await db.UsersPersonalModel.findOne({uid:user.uid});
		if(!userPersonal || !userPersonal.mobile) ctx.throw(400, "该用户尚未绑定手机号,请驳回开店申请");
		let newStoreInfo = {
			storeId:storeId,
			uid: apply.uid,
			mobile: [userPersonal.mobile]
		}
		const newDecoration = new db.ShopDecorationsModel({storeId: storeId});
		const newStore = new db.ShopStoresModel(newStoreInfo);
		newDecoration.save();
		newStore.save();
		await next();
	})
	.post('/reject', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {id} = body;
		const {user} = data;
		const apply = await db.ShopApplyStoreModel.findOne({_id:id});
		if(!apply) ctx.throw(404, "找不到申请");
		let nowStamp = new Date();
		await apply.update({$set:{applyStatus: "reject", dealApplyToc:nowStamp, dealUid:user.uid}});
		await next();
	})
module.exports = applysRouter;