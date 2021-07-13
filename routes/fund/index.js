const Router = require('koa-router');
const fundRouter = new Router();
const applicationRouter = require('./application/index');
const listRouter = require('./list/index');
const meRouter = require('./me');
const disabledRouter = require('./disabled');
const infoRouter = require('./info');
const billsRouter = require('./bills');
const billRouter = require('./bill');
const donationRouter = require('./donation');
const historyRouter = require('./history');
const unSubmitRouter = require('./unSubmit');
const giveUpRouter = require('./giveUp');
const path = require('path');
fundRouter
	//检测科创基金是否开放
	.use('/', async (ctx, next) => {
		const {data, db, nkcModules, state} = ctx;
		const fundSettings = await db.SettingModel.getSettings('fund');
    data.fundSettings = fundSettings;
		if(!fundSettings.enableFund) { // 已关闭
		  ctx.throw(403, `${fundSettings.fundName}已关闭`);
    } else if(fundSettings.closed.status) { // 临时关闭
      return ctx.body = nkcModules.render(path.resolve(__dirname, '../../pages/fund/closed.pug'), data, state);
    } else if(fundSettings.readOnly) { // 只读模式
      if(ctx.method !== 'GET') {
        ctx.throw(403, `${fundSettings.fundName}现已开启只读模式`);
      }
    }
    await next();
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
    data.applying = await db.FundApplicationFormModel.extendAsApplicationFormList(applying);
    const funding = await db.FundApplicationFormModel.find(queryOfFunding).sort({toc: -1}).limit(10);
    data.funding = await db.FundApplicationFormModel.extendAsApplicationFormList(funding);
    const excellent = await db.FundApplicationFormModel.find(queryOfExcellent).sort({toc: 1});
    data.excellent = await db.FundApplicationFormModel.extendAsApplicationFormList(excellent);
	  const completed = await db.FundApplicationFormModel.find(queryOfCompleted).sort({timeOfCompleted: -1});
    data.completed = await db.FundApplicationFormModel.extendAsApplicationFormList(completed);
    data.funds = await db.FundModel.find({
      display: true,
      disabled: false,
      history: false
    }).sort({toc: 1});
    const donationBills = await db.FundBillModel.find({
	    'from.type': 'user',
	    'from.anonymous': false,
	    'from.id': {$ne: ''},
	    abstract: '赞助',
	    verify: true
    }).sort({toc: -1}).limit(12);

    //查询赞助人 统计赞助总金额
		let donationUsers = [];
		for(let b of donationBills) {
			const uid = b.from.id;
			let flag = false;
			for(let d of donationUsers) {
				if(d.uid === uid) {
					d.money += b.money;
					flag = true;
					break;
				}
			}
			if(!flag) {
				donationUsers.push({
					uid,
					money: b.money,
					user: await db.UserModel.findOnly({uid})
				});
			}
		}
		if(donationUsers.length < 10) {
			donationUsers = donationUsers.slice(0, 6);
		}
		data.donationUsers = donationUsers;
		// ctx.template = 'fund/fundHome.pug';
    ctx.template = 'fund/home.pug';
    await next();
  })
	// 新建基金
	.get('/add', async (ctx, next) => {
		const {data, db} = ctx;
		const fundCerts = [];
		const roles = await db.RoleModel.find().sort({toc: 1});
		for(const role of roles) {
		  fundCerts.push({
        _id: role._id,
        displayName: role.displayName
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
	.use('/bills', billsRouter.routes(), billsRouter.allowedMethods())
	.use('/bill', billRouter.routes(), billRouter.allowedMethods())
	.use('/donation', donationRouter.routes(), donationRouter.allowedMethods())
	.use('/history', historyRouter.routes(), historyRouter.allowedMethods())
	.use('/unsubmit', unSubmitRouter.routes(), unSubmitRouter.allowedMethods())
	.use('/giveup', giveUpRouter.routes(), giveUpRouter.allowedMethods())
	.use('/disabled', disabledRouter.routes(), disabledRouter.allowedMethods());
module.exports = fundRouter;