const Router = require('koa-router');
const listRouter = new Router();
const apiFn = require('../../nkcModules').apiFunction;
listRouter
	// 基金项目列表
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;

		await next();
	})
	// 添加基金项目
	.post('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {fundObj} = ctx.body;
		ctx.print('newFund', fundObj);
		fundObj.name = fundObj.name || '科创基金';
		const fund = await db.FundModel.findOne({_id: fundObj._id});
		if(fund) ctx.throw(400, '该基金编号已经存在，请更换');
		const newFund = db.FundModel(fundObj);
		await newFund.save();
		data.fund = newFund;
		await next();
	})
	// 删除基金项目
	.del('/:fundId', async (ctx, next) => {
		const {data, db} = ctx;
		const {fundId} = ctx.params;
		const fund = await db.FundModel.findOnly({_id: fundId});
		await fund.remove();
		await next();
	})
	// 修改基金项目
	.patch('/:fundId', async (ctx, next) => {
		const {data, db} = ctx;
		const {fundId} = ctx.params;
		const {fundObj} = ctx.body;
		const fund = await db.FundModel.findOnly({_id: fundId});
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
		const fund = await db.FundModel.findOnly({_id: fundId, display: true});
		data.fund = fund;
		let query = {
			disabled: false
		};
		if(type === 'excellent') { // 优秀的项目
			query = {
				'status.excellent': true
			};
		} else if(type === 'complete'){ // 已完成的项目
			query = {
				'status.complete': true
			};
		} else if(type === 'passed') { // 资助中
			query = {
				'status.remittance': true
			}
		} else if(type === 'inReview') { // 正在申请
			query = {
				'lock.status': {$ne: 0},
				'status.adminAgree': {$ne: true}
			}
		} else { // 全部
			query = {
				'lock.status': {$ne: 0},
			};
		}
		const length = await FundApplicationFormModel.count(query);
		const paging = apiFn.paging(page, length);
		data.applications = await FundApplicationFormModel.find(query).skip(paging.start).limit(paging.perpage);
		data.message = await user.getUnCompletedFundApplication();
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
		ctx.template = 'interface_fund_setting.pug';
		await next();
	})
	// 该基金项目下的基金申请
	.get('/:fundId/add', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {fundId} = ctx.params;
		const {agree} = ctx.query;
		const fund = await db.FundModel.findOnly({_id: fundId, display: true});
		data.fund = fund;
		ctx.template = 'interface_fund_agreement.pug';
		const message = await user.getUnCompletedFundApplication();
		if(message) {
			data.message = message;
			return await next();
		}
		if(agree !== 'true') {
			return await next();
		}
		try {
			fund.ensurePermission(user);
		} catch(e) {
			ctx.throw(401, e);
		}
		console.log('asdf');
		const applicationForm = {};
		applicationForm._id = await db.SettingModel.operateSystemID('fundApplicationForms', 1);
		applicationForm.uid = user.uid;
		applicationForm.fundId = fundId;
		const newApplicationForm = db.FundApplicationFormModel(applicationForm);
		await newApplicationForm.save();
		ctx.redirect(`/fund/a/${applicationForm._id}/settings`);
		await next();
	});
module.exports = listRouter;