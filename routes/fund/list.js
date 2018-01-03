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
		const {fundId} = ctx.params;
		const {type} = ctx.query;
		const {FundApplicationFormModel} = db;
		let page = ctx.query.page;
		page = page? parseInt(page): 0;
		data.type = type;
		data.page = page;
		data.fund = await db.FundModel.findOnly({_id: fundId, display: true});
		let query;
		if(type === 'excellent') { // 优秀的项目
			query = {
				excellent: true
			};
		} else if(type === 'complete'){ // 已完成的项目
			query = {
				complete: true
			};
		} else if(type === 'passed') { // 资助中
			query = {
				remittance: true
			}
		} else if(type === 'inReview') { // 正在申请
			query = {
				pStatus: {$ne: 0},
				uStatus: {$ne: 0},
				remittance: null
			}
		} else { // 全部
			query = {
				pStatus: {$ne: 0},
				uStatus: {$ne: 0}
			};
		}
		const length = await FundApplicationFormModel.count(query);
		const paging = apiFn.paging(page, length);
		const q = FundApplicationFormModel.match(query);
		data.applications = await FundApplicationFormModel.find(q).skip(paging.start).limit(paging.perpage);
		const userQuery = FundApplicationFormModel.match({
			resultSuccessful: null
		});
		data.userApplication = await FundApplicationFormModel.findOne(userQuery);
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
		let userQuery = db.FundApplicationFormModel.match({
			resultSuccessful: null,
		});
		userQuery.uid = user.uid;
		const notCompleteApplication = await db.FundApplicationFormModel.findOne(userQuery);
		if(notCompleteApplication) {
			data.notAllow = true;
			data.applicationForm = notCompleteApplication;
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
		const moment = require('moment')();
		const applicationForm = {};
		/*const year = moment.format('YYYY');
		applicationForm.year = year;
		const a = await db.FundApplicationFormModel.findOne({year, fundId}).sort({order: -1});
		applicationForm.order = a? a.order+1: 1;
		applicationForm._id = year + fundId + applicationForm.order;*/
		applicationForm._id = await db.SettingModel.operateSystemID('fundApplicationForms', 1);
		applicationForm.uid = user.uid;
		applicationForm.fundId = fundId;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const {name, idCardNumber, photos} = userPersonal.privateInformation;
		const {idCardA, idCardB, handheldIdCard, certs} = photos;
		applicationForm.userMessages = {
			name,
			idCardNumber,
			mobile: userPersonal.mobile,
			idCardA,
			idCardB,
			handheldIdCard,
			certs
		};
		const newApplicationForm = db.FundApplicationFormModel(applicationForm);
		await newApplicationForm.save();
		ctx.redirect(`/fund/a/${applicationForm._id}/settings`);
		await next();
	});
module.exports = listRouter;