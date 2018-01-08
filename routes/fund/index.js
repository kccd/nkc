const Router = require('koa-router');
const fundRouter = new Router();
const applicationRouter = require('./application');
const listRouter = require('./list');
const meRouter = require('./me');
fundRouter
	.use('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.fundList = await db.FundModel.find({display: true}).sort({toc: 1});

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
		await next();
	})
	.get('/m', async (ctx, next) => {
		const {data, db} = ctx;
		data.fundList = await db.FundModel.find({}).sort({toc: 1});
		data.management = true;
		ctx.template = 'interface_fund_management.pug';
		await next();
	})
	.get('/me', async (ctx, next) => {
		const {data, db} = ctx;

		await next();
	})
	.use('/list', listRouter.routes(), listRouter.allowedMethods())
  .use('/a', applicationRouter.routes(), applicationRouter.allowedMethods())
	.use('/me', meRouter.routes(), meRouter.allowedMethods());
module.exports = fundRouter;