const Router = require('koa-router');
const addRouter = new Router();
addRouter
// 该基金项目下的基金申请
	.use('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {fundId} = ctx.params;
		const fund = await db.FundModel.findOnly({_id: fundId.toUpperCase()});
		await db.FundModel.ensureUserPermission(user.uid, fund._id);
		data.fund = fund;
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data} = ctx;
		data.nav = '基金申请';
		ctx.template = 'fund/terms.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user, fund} = data;
		const {fundId} = ctx.params;
		const applicationForm = {};
		applicationForm._id = await db.SettingModel.operateSystemID('fundApplicationForms', 1);
		applicationForm.uid = user.uid;
		applicationForm.fundId = fundId.toUpperCase();
		applicationForm.fixedMoney = !!fund.money.fixed;
		if(fund.applicantType.includes('personal')) {
			applicationForm.from = 'personal';
		} else if(fund.applicantType.includes('team')) {
			applicationForm.from = 'team'
		} else {
			ctx.throw(403,'该基金设置中未勾选个人申请和团队申请！');
		}
		applicationForm.auditType = fund.auditType;
    const newApplicationForm = db.FundApplicationFormModel(applicationForm);
    await newApplicationForm.save();
    await newApplicationForm.initApplicant();
    await newApplicationForm.initProject();
		data.applicationFormId = newApplicationForm._id;
		await next();
	});
module.exports = addRouter;