const Router = require('koa-router');
const billRouter = new Router();
billRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, params} = ctx;
		let {fundId} = query;
		const {uid} = params;
		const user = await db.UserModel.findOnly({uid});
		data.targetUser = user;
		const page = query.page? parseInt(query.page): 0;
		const q = {verify: true};
		if(fundId) {
			fundId = fundId.toUpperCase();
			data.fund = await db.FundModel.findOnly({_id: fundId});
			q.$or = [
				{
					'from.type': 'fund',
					'from.id': fundId,
					'to.type': 'user',
					'to.id': user.uid
				},
				{
					'to.type': 'fund',
					'to.id': fundId,
					'from.type': 'user',
					'from.id': user.uid
				}
			];
		} else {
			q.$or = [
				{
					'to.type': 'user',
					'to.id': user.uid
				},
				{
					'from.type': 'user',
					'from.id': user.uid
				}
			]
		}
		const length = await db.FundBillModel.countDocuments(q);
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, length);
		data.paging = paging;
		const bills = await db.FundBillModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		await Promise.all(bills.map(async bill => {
			await bill.extendFromInfo();
			await bill.extendToInfo();
			await bill.extendUser();
		}));
		data.bills = bills;
		ctx.template = 'interface_user_bills.pug';
		await next();
	});
module.exports = billRouter;