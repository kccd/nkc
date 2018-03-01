const Router = require('koa-router');
const listRouter = new Router();
const apiFn = require('../../../nkcModules/index').apiFunction;
const billsRouter = require('./bills');
const settingsRouter = require('./settings');
const addRouter = require('./add');
listRouter
	// 基金项目列表
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.funds = await db.FundModel.find({display: true, disabled: false}).sort({toc: 1});
		ctx.template = 'interface_fund_list.pug';
		await next();
	})
	// 添加基金项目
	.post('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {fundObj} = ctx.body;
		fundObj.name = fundObj.name || '科创基金';
		const fund = await db.FundModel.findOne({_id: fundObj._id});
		if(fund) ctx.throw(400, '该基金编号已经存在，请更换');
		if(!fundObj.applicationMethod.personal && !fundObj.applicationMethod.team) ctx.throw(400, '必须勾选申请方式。');
		const newFund = db.FundModel(fundObj);
		await newFund.save();
		const newBill = db.FundBillModel({
			fundId: newFund._id,
			changed: newFund.money.initial,
			uid: user.uid,
			notes: '基金初始金额',
			abstract: '初始'
		});
		await newBill.save();
		data.fund = newFund;
		await next();
	})
	// 修改基金项目
	.patch('/:fundId', async (ctx, next) => {
		const {data, db} = ctx;
		const fundId = ctx.params.fundId.toUpperCase();
		const {fundObj} = ctx.body;
		const fund = await db.FundModel.findOnly({_id: fundId});
		if(!fundObj.applicationMethod.personal && !fundObj.applicationMethod.team) ctx.throw(400, '必须勾选申请方式。');
		await fund.update(fundObj);
		data.fund = fund;
		await next();
	})
	// 具体基金项目信息页面
	.get('/:fundId', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {fundId} = ctx.params;
		const {type} = ctx.query;
		const {FundApplicationFormModel} = db;
		let page = ctx.query.page;
		page = page? parseInt(page): 0;
		data.type = type;
		data.page = page;
		const fund = await db.FundModel.findOnly({_id: fundId.toUpperCase(), disabled: false});
		data.fund = fund;
		let query = {
			'status.submitted': true,
			fundId: fund._id
		};
		if(!fund.ensureOperatorPermission('admin', user)) {
			query.disabled = false;
		}
		if(type === 'excellent') { // 优秀项目
			query['status.excellent'] = true;
		} else if(type === 'completed'){ // 已完成
			query['status.completed'] = true;
		} else if(type === 'funding') { // 资助中
			query['status.completed'] = {$ne: true};
			query['status.adminSupport'] = true;
		} else if(type === 'auditing') { // 审核中
			query['status.adminSupport'] = {$ne: true};
			query.useless = null;
		} else { // 全部

		}
		const length = await FundApplicationFormModel.count(query);
		const paging = apiFn.paging(page, length);
		const applicationForms = await FundApplicationFormModel.find(query).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.applicationForms = await Promise.all(applicationForms.map(async a => {
			await a.extendApplicant();
			await a.extendMembers();
			await a.extendProject();
			return a;
		}));
		data.paging = paging;
		//改由前端判断
		if(data.user) {
			data.message = await fund.getConflictingByUser(user);
			const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
			data.authLevel = await userPersonal.getAuthLevel();
		}
		ctx.template = 'interface_fund_messages.pug';
		await next();
	})
	.use('/:fundId/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
	.use('/:fundId/add', addRouter.routes(), addRouter.allowedMethods())
	.use('/:fundId/bills', billsRouter.routes(), billsRouter.allowedMethods());
module.exports = listRouter;