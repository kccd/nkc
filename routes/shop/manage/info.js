const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		let dealInfo = await db.ShopDealInfoModel.findOne({uid:user.uid});
		if(dealInfo) {
			var locationArray = dealInfo.address.split("&");
			if(locationArray.length > 1){
				dealInfo.location = locationArray[0];
				dealInfo.address = locationArray[1];	
			}else{
				dealInfo.location = "";
				dealInfo.address = "";
			}
		}
		data.dealInfo = dealInfo;
		ctx.template = 'shop/manage/info.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		const {dealDescription, address, dealAnnouncement} = body;
		const {user} = data;
		const uid = params.uid;
		if(!uid || uid !== user.uid) ctx.throw("403", "您无权修改他人的交易信息");
		const userPersonal = await db.UsersPersonalModel.findOne({uid:user.uid});
		if(!userPersonal || !userPersonal.mobile) ctx.throw(400, "您尚未绑定手机号,请移步身份认证一");
		let dealInfo = await db.ShopDealInfoModel.findOne({uid:user.uid});
		if(!dealInfo) {
			dealInfo = new db.ShopDealInfoModel({
				uid: user.uid
			});
			await dealInfo.save();
		}
		await dealInfo.updateOne({$set:{
			dealAnnouncement: dealAnnouncement, 
			dealDescription:dealDescription, 
			address:address,
			mobile: [userPersonal.mobile],
			dataPerfect:true
		}});
		await next();
	})
module.exports = infoRouter;