const Router = require('koa-router');
const listRouter = new Router();
const singleFundRouter = require('./singleFund');
listRouter
	// 基金项目列表
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.funds = await db.FundModel.find({display: true, disabled: false, history: false}).sort({toc: 1});
		ctx.template = 'interface_fund_list.pug';
		await next();
	})
	// 添加基金项目
	.post('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {fundObj} = ctx.body;
		fundObj.name = fundObj.name || '科创基金';
		const fund = await db.FundModel.findOne({_id: fundObj._id});
		if(fund) ctx.throw(400, '该基金编号已经存在，请更换');
		if(!fundObj.applicationMethod.personal && !fundObj.applicationMethod.team) ctx.throw(400, '必须勾选申请方式。');
		if(fundObj.auditType === 'system' && fundObj.admin.appointed.length === 0) {
			ctx.throw(400, '系统审核必须指定管理员UID。');
		}
		const newFund = db.FundModel(fundObj);
		await newFund.save();
		data.fund = newFund;
		await next();
	})
  .use('/:fundId', singleFundRouter.routes(), singleFundRouter.allowedMethods());
module.exports = listRouter;
