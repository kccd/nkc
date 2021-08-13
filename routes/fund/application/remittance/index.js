const Router = require('koa-router');
const applyRouter = require('./apply');
const verifyRouter = require('./verify');
const remittanceRouter = new Router();
remittanceRouter
	.use('/', async (ctx, next) => {
		const {applicationForm} = ctx.data;
		if(applicationForm.disabled) ctx.throw(400, '申请表已被屏蔽');
		if(applicationForm.useless) ctx.throw(400, '申请表已失效，无法完成该操作。');
		const {adminSupport, completed} = applicationForm.status;
		if(!adminSupport) ctx.throw(400, '管理员复核暂未通过无法进行拨款操作');
		if(completed) ctx.throw(400, '申请已经结题，无法执行拨款操作');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {db, data} = ctx;
		const {user, applicationForm} = data;
		const {remittance, fund} = applicationForm;
		if(!fund.ensureOperatorPermission('financialStaff', user)) ctx.throw(403,'抱歉！您没有资格进行拨款。');
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
		const {account, fund, remittance} = applicationForm;
		if(!applicationForm.lock.submitted) ctx.throw(400, '抱歉！该申请表暂未提交。');
		if(!fund.ensureOperatorPermission('financialStaff', user)) ctx.throw(403,'抱歉！您没有资格进行拨款。');
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
				r.time = new Date();
				r.apply = false;
				const {paymentType, name, number} = account;
				const _id = Date.now();

				const obj = {
					_id,
					money: r.money,
					from: {
						type: 'fund',
						id: fund._id
					},
					to: {
						type: 'user',
						id: applicationForm.uid,
						anonymous: false
					},
					verify: true,
					applicationForm: applicationForm._id,
					abstract: '拨款',
					notes: `${applicationForm.code}第${i+1}期拨款`,
					uid: user.uid
				};

				//支付宝
				if(paymentType === 'alipay') {
					const {alipay2} = ctx.nkcModules;
					let alipayData;
					try {
						alipayData = await alipay2.transfer({
							account: number,
							name,
							money: r.money,
							notes: obj.notes,
							id: _id
						});
						obj.otherInfo = {
							paymentType: 'alipay',
							transactionNumber: alipayData.orderId,
							name,
							account: number
						}
            await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");
					} catch (err) {
						const errorInfo = err.message;
						r.status = false;
						r.subCode = errorInfo;
						r.description = errorInfo;
						const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
						const newDocument = db.FundDocumentModel({
							_id: newId,
							type: 'remittance',
							uid: user.uid,
							applicationFormId: applicationForm._id,
							c: errorInfo,
							support: false
						});
						await applicationForm.updateOne({remittance});
						await newDocument.save();
            await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");
						return await next();
					}
				}

				const newFundBill = db.FundBillModel(obj);
				await newFundBill.save();

				const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
				r.report = newId;
				const newReport = db.FundDocumentModel({
					_id: newId,
					uid: user.uid,
					type: 'system',
					applicationFormId: applicationForm._id,
					c: `第 ${i+1} 期拨款 ${r.money}元 完成`,
					support: true
				});
				await newReport.save();
				break;
			}
		}
		const obj = {remittance};
		if(number === 0) {
			obj['status.remittance'] = true;
			obj.submittedReport = false;
		}
		await applicationForm.updateOne(obj);
    await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");

    await next();
	})


  .use('/apply', applyRouter.routes(), applyRouter.allowedMethods())
  .use('/verify', verifyRouter.routes(), verifyRouter.allowedMethods())
module.exports = remittanceRouter;
