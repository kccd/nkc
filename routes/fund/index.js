const Router = require('koa-router');
const fundRouter = new Router();
const applicationRouter = require('./application/index');
const listRouter = require('./list/index');
const meRouter = require('./me');
const disabledRouter = require('./disabled');
const infoRouter = require('./info');
const settingsRouter = require('./settings');
const billsRouter = require('./bills');
fundRouter
	//检测科创基金是否开放
	.use('/', async (ctx, next) => {
		const {data, db} = ctx;
		const fundSettings = await db.SettingModel.findOne({uid: 'fund'});
		data.fundSettings = fundSettings;
		if(!fundSettings) {
			const newSettings = db.SettingModel({
				uid: 'fund',
				description: '这是基金介绍',
				terms: '这是科创基金总条款',
				money: 0,
				readOnly: false,
				closed: {
					status: false,
					reason: '这是关闭原因',
					openingHours: Date.now(),
					closingTime: Date.now(),
					uid: '10',
					username: '虎哥'
				}
			});
			await newSettings.save();
			await next();
		} else {
			if(ctx.url === '/fund/settings') {
				await next();
			} else {
				if(fundSettings.closed.status) {
					ctx.template = 'interface_fund_closed.pug';
					data.fundSettings = fundSettings;
					data.error = '抱歉！科创基金已被临时关闭。';
					const body = require('../../middlewares/body');
					await body(ctx, ()=>{});
				} else if(fundSettings.readOnly) {
					if(ctx.method !== 'GET') {
						ctx.throw(401, '抱歉！科创基金现在处于只读模式。');
					}
					await next();
				} else {
					await next();
				}
			}
		}
	})

	//加载基金申请邀请通知数
	.use('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		let newNotify = 0;
		if(user) {
			const aUsers = await db.FundApplicationUserModel.find({uid: user.uid});
			await Promise.all(aUsers.map(async a => {
				if(a.agree === null) {
					const applicationForm = await db.FundApplicationFormModel.findOnly({_id: a.applicationFormId});
					if(user.uid !== applicationForm.uid && applicationForm.disabled === false && applicationForm.useless === null) newNotify++;
				}
			}));
		}
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
		const queryOfCompleted = {
			disabled: false,
			'status.completed': true,
			useless: null
		};
    const applying = await db.FundApplicationFormModel.find(queryOfApplying).sort({toc: -1}).limit(10);
    data.applying = await Promise.all(applying.map(async a => {
			await a.extendFund();
			if(a.fund) {
				await a.extendApplicant();
				await a.extendProject();
				return a;
			}
    }));
    const funding = await db.FundApplicationFormModel.find(queryOfFunding).sort({toc: -1}).limit(10);
	  data.funding = await Promise.all(funding.map(async a => {
		  await a.extendFund();
		  if(a.fund) {
			  await a.extendApplicant();
			  await a.extendProject();
			  return a;
		  }
	  }));
    const excellent = await db.FundApplicationFormModel.find(queryOfExcellent).sort({toc: 1});
	  data.excellent = await Promise.all(excellent.map(async a => {
		  await a.extendFund();
		  if(a.fund) {
			  await a.extendApplicant();
			  await a.extendProject();
			  return a;
		  }
	  }));
	  const completed = await db.FundApplicationFormModel.find(queryOfCompleted).sort({toc:1});
	  data.completed = await Promise.all(completed.map(async a => {
		  await a.extendFund();
		  if(a.fund) {
			  await a.extendApplicant();
			  await a.extendProject();
			  return a;
		  }
	  }));
		data.home = true;
    data.funds = await db.FundModel.find({display: true, disabled: false}).sort({toc: 1});
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
	.use('/info', infoRouter.routes(), infoRouter.allowedMethods())
	.use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
	.use('/bills', billsRouter.routes(), billsRouter.allowedMethods())
	.use('/disabled', disabledRouter.routes(), disabledRouter.allowedMethods());
module.exports = fundRouter;