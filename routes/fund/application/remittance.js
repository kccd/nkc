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
					const {alipay} = ctx.nkcModules;
					const {transferError} = ctx.settings.alipay;
					let alipayData;
					try {
						alipayData = await alipay.transfer({
							account: number,
							name,
							money: r.money,
							notes: obj.notes,
							id: _id
						});
						obj.otherInfo = {
							paymentType: 'alipay',
							transactionNumber: alipayData.alipayId,
							name,
							account: number
						}
					} catch (err) {
						const {subCode} = err;
						let description;
						for(let a of transferError) {
							if(a.subCode === subCode) {
								description = a.description;
								break;
							}
						}
						r.status = false;
						r.subCode = subCode;
						r.description = description;
						const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
						const newDocument = db.FundDocumentModel({
							_id: newId,
							type: 'remittance',
							uid: user.uid,
							applicationFormId: applicationForm._id,
							c: description,
							support: false
						});
						await applicationForm.update({remittance});
						await newDocument.save();
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
		await applicationForm.update(obj);
		await next();
	})
	.get('/apply', async (ctx, next) => {
		const {data, db} = ctx;
		const {applicationForm, user} = data;
		if(applicationForm.uid !== user.uid) ctx.throw(403,'权限不足');
		ctx.template = 'interface_fund_apply_remittance.pug';
		data.nav = '申请拨款';
		data.reportAudit = await db.FundDocumentModel.findOne({type: 'reportAudit'}).sort({toc: -1});
		await next();
	})
	.post('/apply', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {applicationForm, user} = data;
		const {money, account, fund, remittance, timeToPassed, reportNeedThreads} = applicationForm;
		if(!applicationForm.lock.submitted) ctx.throw(400, '抱歉！该申请表暂未提交。');
		if(applicationForm.uid !== user.uid) ctx.throw(403,'权限不足');
		if(applicationForm.completedAudit) ctx.throw(400, '您已经申请结题，不能再申请拨款。');
		const {number, c, selectedThreads} = body;

	  // 系统审核
		// 系统审核不存在分期拨款
		// 若分期不正确则修复分期
		// 自动拨款只支持支付宝账号
		// 当自动拨款出错，若是用户输入的用户名或账号错误则直接更改申请表为未提交的状态，用户可编辑后再提交，否则等待财务人员处理
		if(fund.auditType === 'system') {
			if(remittance.length !== 1) {
				const remittance = [{
					money: applicationForm.money,
					status: null
				}];
				await applicationForm.update({remittance});
			}
			if(remittance[0].status) ctx.throw(400, '拨款已成功，请勿重复提交。');
			if(account.paymentType !== 'alipay') ctx.throw(400, '系统审核只支持支付宝账号。');
			const balance = await db.FundBillModel.getBalance('fund', fund._id);
			if(remittance[0].money > balance) ctx.throw(400, '该基金余额不足。');
			const {number, name} = account;
			const {alipay} = ctx.nkcModules;
			const {transferError} = ctx.settings.alipay;
			let alipayData;
			const _id = Date.now();
			const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
			const newReport = db.FundDocumentModel({
				_id: newId,
				uid: user.uid,
				applicationFormId: applicationForm._id,
				type: 'system',
				c: `申请第 1 期拨款`,
				support: true
			});
			await newReport.save();
			try {
				alipayData = await alipay.transfer({
					account: number,
					name,
					money,
					id: _id,
					notes: `${applicationForm.code}第1期拨款`
				});
				const newBill = db.FundBillModel({
					_id,
					money,
					from: {
						type: 'fund',
						id: fund._id
					},
					to: {
						type: 'user',
						id: user.uid,
						anonymous: false
					},
					verify: true,
					applicationFormId: applicationForm._id,
					abstract: '拨款',
					notes: `${applicationForm.code}第1期拨款`,
					uid: fund.admin.appointed[0],
					otherInfo: {
						paymentType: 'alipay',
						transactionNumber: alipayData.alipayId,
						name,
						account: number
					}
				});
				await newBill.save();
				remittance[0].status = true;
				await applicationForm.update({'status.remittance': true, remittance});
				const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
				const newReport = db.FundDocumentModel({
					_id: newId,
					uid: fund.admin.appointed[0],
					applicationFormId: applicationForm._id,
					type: 'system',
					c: `第 1 期拨款 ${money}元 完成`,
					support: true
				});
				await newReport.save();
			} catch (err) {
				const {subCode} = err;
				const updateObj = {};
				if(['PAYEE_USER_INFO_ERROR', 'PAYEE_NOT_EXIST'].includes(subCode)) {
					updateObj['lock.submitted'] = false;
				}
				const documentId = await db.SettingModel.operateSystemID('fundDocuments', 1);
				let description;
				for(let a of transferError) {
					if(a.subCode === subCode) {
						description = a.description;
						break;
					}
				}
				remittance[0].status = false;
				remittance[0].subCode = subCode;
				remittance[0].description = description;
				updateObj.remittance = remittance;
				const newDocument = db.FundDocumentModel({
					_id: documentId,
					type: 'remittance',
					uid: fund.admin.appointed[0],
					applicationFormId: applicationForm._id,
					c: description,
					support: false
				});
				await applicationForm.update(updateObj);
				await newDocument.save();
			}
		} else {
			// 人工审核
			// 申请第一期拨款不需要附带文章
			// 附带文章的发表时间必须晚于申请表申请时间
			for(let i = 0; i < remittance.length; i++) {
				const r = remittance[i];
				if(i < number) {
					if(!r.status) ctx.throw(400, `第 ${i+1} 期尚未完成拨款，请依次申请拨款。`);
					if(!r.verify) ctx.throw(400, `请先确认收款后再申请后面的拨款。`);
				}
				if(i === number) {
					if(r.status === false) {
						ctx.throw(400, `拨款已失败：${r.description}`);
					} else if(r.status === true) {
						ctx.throw(400, `拨款已完成，请勿重复提交。`);
					} else {
						// 申请第一期拨款不需要附带文章
						if(i === 0) {
							r.passed = true;
							r.apply = true;
							const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
							const newReport = db.FundDocumentModel({
								_id: newId,
								uid: user.uid,
								applicationFormId: applicationForm._id,
								type: 'system',
								c: `申请第 1 期拨款`,
								support: true
							});
							await newReport.save();
						} else {
							if(reportNeedThreads && selectedThreads.length === 0) {
								ctx.throw(400, '申请拨款必须要附带代表中期报告的文章。');
							}
							//验证附带文章的发表时间
							await Promise.all(selectedThreads.map(async t => {
								const thread = await db.ThreadModel.findOnly({tid: t.tid});
								if(thread.toc < timeToPassed) ctx.throw(400, '请选择申请项目之后所发的文章。')
							}));
							const reportId_1 = await db.SettingModel.operateSystemID('fundDocuments', 1);
							const reportId_2 = await db.SettingModel.operateSystemID('fundDocuments', 1);
							const obj = {
								_id: reportId_1,
								uid: user.uid,
								type: 'report',
								applicationFormId: applicationForm._id,
								c
							};
							const report_1 = db.FundDocumentModel(obj);
							obj.c = `申请第 ${i+1} 期拨款`;
							obj.support = true;
							obj._id = reportId_2;
							const report_2 = db.FundDocumentModel(obj);
							await report_1.save(); // 提交的报告
							await report_2.save(); // 自动生成的报告
							r.report = reportId_1;
							r.threads = selectedThreads.map(t => t.tid.toString());
							r.passed = null;
							r.apply = true;
						}
						await applicationForm.update({remittance, submittedReport: i !== 0})
					}
					break;
				}
			}
		}
		await next();
	})
	.patch('/verify', async (ctx, next) => {
		const {data, body, db} = ctx;
		const {number} = body;
		if(number === undefined) {
			ctx.throw(400, '参数错误。');
		}
		const {user, applicationForm} = data;
		//判断操作者身份，只有申请人才有权限确认收款
		if(user.uid !== applicationForm.uid) {
			ctx.throw(400, '您不是申请人，无权完成该操作。');
		}
		//判断第几期拨款需要确认，与用户上传的参数比对
		const {remittance} = applicationForm;
		let num;
		for(let i = 0; i < remittance.length; i++) {
			const r = remittance[i];
			if(r.status === true && !r.verify) {
				num = i;
				break;
			}
		}
		if(number !== num) ctx.throw(400, '参数错误。');
		const r = remittance[number];
		r.verify = true;
		const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
		const newReport = db.FundDocumentModel({
			_id: newId,
			uid: user.uid,
			type: 'system',
			applicationFormId: applicationForm._id,
			support: true,
			c: `第 ${number + 1} 期申请人确认收款`
		});
		await newReport.save();
		await applicationForm.update({remittance});
		await next();
	});
module.exports = remittanceRouter;