const Router = require('koa-router');
const remittanceRouter = new Router();
remittanceRouter
	.use('/', async (ctx, next) => {
		const {applicationForm} = ctx.data;
		if(applicationForm.disabled) ctx.throw(400, '抱歉！该申请表已被屏蔽。');
		if(applicationForm.useless) ctx.throw(400, '申请表已失效，无法完成该操作。');
		const {adminSupport, completed} = applicationForm.status;
		if(!adminSupport) ctx.throw(400, '管理员复核暂未通过无法进行拨款操作，请等待。');
		if(completed) ctx.throw(400, '抱歉！该申请已经结题，不需要拨款。');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {db, data} = ctx;
		const {user, applicationForm} = data;
		const {remittance, fund} = applicationForm;
		if(!fund.ensureOperatorPermission('financialStaff', user)) ctx.throw(401, '抱歉！您没有资格进行拨款。');
		ctx.template = 'interface_fund_remittance.pug';
		await Promise.all(remittance.map(async r => {
			if(r.uid) {
				r.user = await db.UserModel.findOnly({uid: r.uid});
			}
		}));
		data.nav = '拨款';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, body, db} = ctx;
		const {applicationForm, user} = data;
		const {number} = body;
		const {fund, remittance} = applicationForm;
		if(!fund.ensureOperatorPermission('financialStaff', user)) ctx.throw(401, '抱歉！您没有资格进行拨款。');
		for(let i = 0; i < remittance.length; i++) {
			const r = remittance[i];
			if(i < number && !r.status) ctx.throw(400, '请依次拨款！');
			if(i === number) {
				if(r.status) ctx.throw(400, '已经打过款了，请勿重复提交！');
				if(!r.passed && i !== 0) ctx.throw(400, '该申请人的报告还未通过，请通过后再打款。');
				const balance = await db.FundBillModel.getBalance('fund', fund._id);
				if(r.money > balance) ctx.throw(400, '该基金余额不足。');
				r.status = true;
				r.uid = user.uid;
				const time = new Date();
				r.time = time;
				const newFundBill = db.FundBillModel({
					_id: Date.now(),
					uid: user.uid,
					applicationFormId: applicationForm._id,
					fundId: fund._id,
					money: r.money,
					toc: time,
					notes: `${applicationForm.code}第${i+1}期拨款`,
					abstract: '拨款',
					from: {
						type: 'fund',
						id: fund._id
					},
					to: {
						type: 'user',
						id: applicationForm.uid
					}
				});
				await newFundBill.save();

				const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
				r.report = newId;
				const newReport = db.FundDocumentModel({
					_id: newId,
					uid: user.uid,
					type: 'report',
					applicationFormId: applicationForm._id,
					c: `第 ${i+1} 期拨款 ${r.money}元 完成`,
				});

				await newReport.save();
				break;
			}
		}
		const obj = {remittance};
		if(number === 0) {
			obj['status.remittance'] = true;
		}
		await applicationForm.update(obj);
		await next();
	})
	.get('/apply', async (ctx, next) => {
		const {data, db} = ctx;
		const {applicationForm, user} = data;
		if(applicationForm.uid !== user.uid) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_apply_remittance.pug';
		data.reportAudit = await db.FundDocumentModel.findOne({type: 'reportAudit'}).sort({toc: -1});
		await next();
	});
module.exports = remittanceRouter;