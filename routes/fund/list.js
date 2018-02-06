const Router = require('koa-router');
const listRouter = new Router();
const apiFn = require('../../nkcModules').apiFunction;
const billsRouter = require('./bills');
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
		const {fundObj} = ctx.body;
		fundObj.name = fundObj.name || '科创基金';
		const fund = await db.FundModel.findOne({_id: fundObj._id});
		if(fund) ctx.throw(400, '该基金编号已经存在，请更换');
		if(!fundObj.applicationMethod.personal && !fundObj.applicationMethod.team) ctx.throw(400, '必须勾选申请方式。');
		const newFund = db.FundModel(fundObj);
		await newFund.save();
		data.fund = newFund;
		await next();
	})
	// 修改基金项目
	.patch('/:fundId', async (ctx, next) => {
		const {data, db} = ctx;
		const {fundId} = ctx.params;
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
		const fund = await db.FundModel.findOnly({_id: fundId, disabled: false});
		data.fund = fund;
		let query = {
			disabled: false,
			'status.submitted': true,
			fundId: fund._id
		};
		if(type === 'excellent') { // 优秀项目
			query['status.excellent'] = true;
		} else if(type === 'completed'){ // 已完成
			query['status.completed'] = true;
		} else if(type === 'funding') { // 资助中
			query['status.completed'] = {$ne: true};
			query['status.adminSupport'] = true;
		} else if(type === 'auditing') { // 审核中
			query['status.adminSupport'] = {$ne: true};
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
		//改由前端判断
		data.message = await fund.getConflictingByUser(user);
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.authLevel = await userPersonal.getAuthLevel();
		ctx.template = 'interface_fund_messages.pug';
		await next();
	})
	// 具体某个基金项目设置页面
	.get('/:fundId/settings', async (ctx, next) => {
		const {data, db} = ctx;
		const {fundId} = ctx.params;
		const fundCerts = [];
		const {certificates} = ctx.settings.permission;
		for (let cert in certificates) {
			fundCerts.push({
				cert: cert,
				displayName: certificates[cert].displayName
			});
		}
		data.fundCerts = fundCerts;
		data.fund = await db.FundModel.findOnly({_id: fundId});
		data.nav = '基金设置';
		ctx.template = 'interface_fund_setting.pug';
		await next();
	})
	// 该基金项目下的基金申请
	.get('/:fundId/add', async (ctx, next) => {
		const {data, db} = ctx;
		data.nav = '基金申请';
		const {user} = data;
		const {fundId} = ctx.params;
		const {agree} = ctx.query;
		const fund = await db.FundModel.findOne({_id: fundId, canApply: true});
		if(!fund) ctx.throw(400, '抱歉！该基金项目暂不能申请。');
		data.fund = fund;
		ctx.template = 'interface_fund_agreement.pug';
		try {
			await fund.ensureUserPermission(user);
		} catch(e) {
			ctx.throw(401, e);
		}
		const message = await fund.getConflictingByUser(user);
		if(message) ctx.throw(400, message);
		if(agree !== 'true') {
			return await next();
		}
		const applicationForm = {};
		applicationForm._id = await db.SettingModel.operateSystemID('fundApplicationForms', 1);
		applicationForm.uid = user.uid;
		applicationForm.fundId = fundId;
		applicationForm.fixedMoney = !!fund.money.fixed;
		if(fund.applicationMethod.personal) {
			applicationForm.from = 'personal';
		} else if(fund.applicationMethod.team) {
			applicationForm.from = 'team'
		} else {
			ctx.throw(401, '该基金设置中未勾选个人申请和团队申请！');
		}
		const newApplicationForm = db.FundApplicationFormModel(applicationForm);
		await newApplicationForm.save();
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const authLevel = await userPersonal.getAuthLevel();
		const newApplicationUser = db.FundApplicationUserModel({
			applicationFormId: applicationForm._id,
			mobile: userPersonal.mobile? userPersonal.mobile: null,
			uid: user.uid,
			authLevel,

		});
		await newApplicationUser.save();
		ctx.redirect(`/fund/a/${applicationForm._id}/settings`, 301);
		await next();
	})
	.use('/:fundId/bills', billsRouter.routes(), billsRouter.allowedMethods());
module.exports = listRouter;