const Router = require('koa-router');
const fundRouter = new Router();
const applicationRouter = require('./application/index');
const listRouter = require('./list');
const meRouter = require('./me');
fundRouter
	.use('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		let newNotify = 0;
		const aUsers = await db.FundApplicationUserModel.find({uid: user.uid});
		await Promise.all(aUsers.map(async a => {
			if(a.agree === null) {
				const applicationForm = await db.FundApplicationFormModel.findOnly({_id: a.applicationFormId});
				if(user.uid !== applicationForm.uid) newNotify++;
			}
		}));
		data.fundNotify = newNotify;
		data.navbar_highlight = 'fund';
		await next();
	})
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const queryOfApplying = {

    };
    const queryOfBeingFunded = {

    };
    const queryOfExcellent = {

    };

    const applications = {};
    applications.applying = await db.FundApplicationFormModel.find(queryOfApplying);
    applications.beingFunded = await db.FundApplicationFormModel.find(queryOfBeingFunded);
    applications.excellent = await db.FundApplicationFormModel.find(queryOfExcellent);
    data.applications = applications;
		data.home = true;
    data.fundList = await db.FundModel.find({display: true}).sort({toc: 1});
    ctx.template = 'interface_fund.pug';
    await next();
  })
	// 新建基金
	.get('/add', async (ctx, next) => {
		const {data} = ctx;
		const {certificates} = ctx.settings.permission;
		const fundCerts = [];
		for (let cert in certificates) {
			fundCerts.push({
				cert: cert,
				displayName: certificates[cert].displayName
			});
		}
		data.fundCerts = fundCerts;
		ctx.template = 'interface_fund_setting.pug';
		data.nav = '新建基金';
		await next();
	})
	.use('/list', listRouter.routes(), listRouter.allowedMethods())
  .use('/a', applicationRouter.routes(), applicationRouter.allowedMethods())
	.use('/me', meRouter.routes(), meRouter.allowedMethods());
module.exports = fundRouter;