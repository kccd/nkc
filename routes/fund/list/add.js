const Router = require('koa-router');
const addRouter = new Router();
addRouter
// 该基金项目下的基金申请
	.use('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		if(!user.username) return ctx.redirect('/register');
		const {fundId} = ctx.params;
		const fund = await db.FundModel.findOne({_id: fundId.toUpperCase(), canApply: true});
		if(!fund) ctx.throw(400, '抱歉！该基金项目暂不能申请。');
		if(fund.history) ctx.throw(400, '抱歉！该基金项目已被设置为历史基金，不在接受新申请。');
		try {
			await fund.ensureUserPermission(user);
		} catch(e) {
			ctx.throw(403,e);
		}
		const message = await fund.getConflictingByUser(user);
		if(message) ctx.throw(400, message);
		data.fund = fund;
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.nav = '基金申请';
		const fundSettings = await db.SettingModel.findOne({_id: 'fund'});
		data.terms = fundSettings.c.terms;
		ctx.template = 'interface_fund_agreement.pug';
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
		if(fund.applicationMethod.personal) {
			applicationForm.from = 'personal';
		} else if(fund.applicationMethod.team) {
			applicationForm.from = 'team'
		} else {
			ctx.throw(403,'该基金设置中未勾选个人申请和团队申请！');
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
		data.applicationForm = newApplicationForm;
		await next();
	});
module.exports = addRouter;