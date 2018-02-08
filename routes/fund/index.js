const Router = require('koa-router');
const fundRouter = new Router();
const applicationRouter = require('./application/index');
const listRouter = require('./list');
const meRouter = require('./me');
const disabledRouter = require('./disabled');
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
    	disabled: false,
	    useless: null,
			'status.submitted': true,
	    'status.adminSupport': {$ne: true}
    };
    const queryOfFunding = {
	    disabled: false,
			'status.adminSupport': true,
	    'status.completed': {$ne: true}
    };
    const queryOfExcellent = {
	    disabled: false,
			'status.excellent': true
    };

    const applying = await db.FundApplicationFormModel.find(queryOfApplying).sort({toc: -1}).limit(10);
    for(let i = 0; i < applying.length; i++) {
    	const a = applying[i];
	    await a.extendFund();
	    if(!a.fund) {
	    	applying.splice(i, 1);
	    	continue;
	    }
	    await a.extendApplicant();
	    await a.extendProject();
    }
    const funding = await db.FundApplicationFormModel.find(queryOfFunding).sort({toc: -1}).limit(10);
	  for(let i = 0; i < funding.length; i++) {
	  	const a = funding[i];
		  await a.extendFund();
		  if(!a.fund) {
			  applying.splice(i, 1);
			  continue;
		  }
		  await a.extendApplicant();
		  await a.extendProject();
	  }
    const excellent = await db.FundApplicationFormModel.find(queryOfExcellent).sort({toc: 1});
	  for(let i = 0; i < excellent.length; i++) {
	  	const a = excellent[i];
		  await a.extendFund();
		  if(!a.fund) {
			  applying.splice(i, 1);
			  continue;
		  }
		  await a.extendApplicant();
		  await a.extendProject();
	  }
    data.applying = applying;
    data.funding = funding;
    data.excellent = excellent;
		data.home = true;
    data.funds = await db.FundModel.find({display: true}).sort({toc: 1});
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
	.use('/me', meRouter.routes(), meRouter.allowedMethods())
	.use('/disabled', disabledRouter.routes(), disabledRouter.allowedMethods());
module.exports = fundRouter;