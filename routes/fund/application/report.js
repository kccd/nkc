const Router = require('koa-router');
const reportRouter = new Router();
reportRouter
	.use('/', async (ctx, next) => {
		const {applicationForm} = ctx.data;
		if(!applicationForm.status.adminSupport) ctx.throw(400, '暂未通过管理员复核，请通过后再试。');
		if(applicationForm.disabled) ctx.throw(401, '申请表已被屏蔽。');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {applicationForm, user} = data;
		ctx.template = 'interface_fund_report.pug';
		const q = {
			type: {$in: ['report', 'completedReport', 'completedAudit', 'adminAudit', 'userInfoAudit', 'projectAudit', 'moneyAudit', 'vote']},
			applicationFormId: applicationForm._id
		};
		if(!applicationForm.fund.ensureOperatorPermission('admin', user)) {
			q.disabled = false;
		}
		data.reports = await db.FundDocumentModel.find(q).sort({toc: -1});
		await Promise.all(data.reports.map(async r => {
			await r.extendUser();
		}));
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user, applicationForm} = data;
		const {c, t, type, selectedThreads} = body;
		if(applicationForm.status.completed) ctx.throw(400, '该项目已结项。');
		if(applicationForm.useless !== null) ctx.throw(400, '申请表已失效，无法完成该操作。');
		const obj = {};
		if(user.uid !== applicationForm.uid) ctx.throw(403, '权限不足');
		if(type === 'applyRemittance') {
			if(applicationForm.status.completed) ctx.throw(400, '抱歉！该申请已经结题。');
			const {timeToPassed, reportNeedThreads, remittance, fund} = applicationForm;
			for(let i = 0; i < remittance.length; i++) {
				const r = remittance[i];
				if(!r.status) {
					if(reportNeedThreads && selectedThreads.length === 0) ctx.throw(400, '管理员要求提交拨款申请必须要附带代表中期报告的帖子。');

					//验证帖子时间
					await Promise.all(selectedThreads.map(async t => {
						const thread = await db.ThreadModel.findOnly({tid: t.tid});
						if(thread.toc < timeToPassed) ctx.throw(400, '请选择申请项目之后所发的帖子。')
					}));

					r.threads = selectedThreads.map(t => t.tid);
					if(fund.auditType === 'system') {
						r.passed = true;
						obj.submittedReport = false;
					} else {
						r.passed = null;
						obj.submittedReport = true;
					}
					let newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
					r.report = newId;
					const newDocument = db.FundDocumentModel({
						_id: newId,
						uid: user.uid,
						type: 'report',
						applicationFormId: applicationForm._id,
						c: c,
					});
					await newDocument.save();

					//申请拨款 记录
					newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
					r.report = newId;
					const newReport = db.FundDocumentModel({
						_id: newId,
						uid: user.uid,
						type: 'report',
						applicationFormId: applicationForm._id,
						c: `申请第 ${i+1} 期拨款`,
					});
					await newReport.save();
					obj.remittance = remittance;
					break;
				}
			}
			obj.tlm = Date.now();
			await applicationForm.update(obj);
		} else {
			const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
			const newDocument = db.FundDocumentModel({
				_id: newId,
				uid: user.uid,
				c: c,
				t: t,
				applicationFormId: applicationForm._id,
				type: 'report'
			});
			await newDocument.save();
			data.redirect = `/fund/a/${applicationForm._id}/report`;
		}
		await next();
	})
	.get('/audit', async (ctx, next) => {
		const {data, db} = ctx;
		data.type = 'reportAudit';
		const {user, applicationForm} = data;
		const {remittance, reportNeedThreads, submittedReport, fund} = applicationForm;
		if(!fund.ensureOperatorPermission('expert', user)) ctx.throw(401, '抱歉！您没有资格进行报告审核。');
		if(!submittedReport) ctx.throw(400, '申请人暂未提交报告。');
		if(applicationForm.useless !== null) ctx.throw(400, '申请表已失效，无法完成该操作。');
		for(let r of remittance) {
			if(r.status === null && r.passed === null){
				if(reportNeedThreads && r.threads && r.threads.length !== 0) {
					data.threads = await Promise.all(r.threads.map(async t => {
						const thread = await db.ThreadModel.findOnly({tid: t});
						await thread.extendFirstPost().then(p => p.extendUser());
						return thread;
					}));
				}
				data.report = await db.FundDocumentModel.findOnly({_id: r.report});
				break;
			}
		}
		ctx.template = 'interface_fund_report.pug';
		await next();
	})
	.post('/audit', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {applicationForm, user} = data;
		const {submittedReport, remittance, fund} = applicationForm;
		if(!fund.ensureOperatorPermission('expert', user)) ctx.throw(401, '抱歉！您没有资格进行报告审核。');
		const {number, support, c} = body;
		if(!number) ctx.throw(400, '参数错误');
		if(!submittedReport) ctx.throw(400, '申请人暂未提交报告。');
		if(applicationForm.useless !== null) ctx.throw(400, '申请表已失效，无法完成该操作。');
		for(let i = 0; i < remittance.length; i++) {
			const r = remittance[i];
			if((i < number && !r.status) || (i > number && r.status)) ctx.throw(400, '参数错误。');
			if(i === number && r.status) ctx.throw(400, '该报告已通过审核。');
		}
		const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
		const newDocument = db.FundDocumentModel({
			_id: newId,
			uid: user.uid,
			type: 'reportAudit',
			applicationFormId: applicationForm._id,
			c,
			support
		});
		await newDocument.save();
		for(let i = 0; i < remittance.length; i++) {
			const r = remittance[i];
			if(r.status === null && r.passed === null) {
				r.passed = support;
				let str = `第 ${i+1} 期拨款申请通过审核`;
				if(!support) {
					str = `第 ${i+1} 期拨款申请未通过审核。原因：${c}`;
				}
				await applicationForm.update({remittance, submittedReport: false});
				const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
				const newReport = db.FundDocumentModel({
					_id: newId,
					uid: user.uid,
					type: 'report',
					applicationFormId: applicationForm._id,
					c: str
				});
				await newReport.save();
				break;
			}
		}
		await next();
	})
	.del('/:reportId', async (ctx, next) => {
		const {data, db, query, params} = ctx;
		const {applicationForm, user} = data;
		const {type} = query;
		const {reportId} = params;
		if(!applicationForm.fund.ensureOperatorPermission('admin', user)) ctx.throw(401, '抱歉！您不是该基金项目的管理员，无法完成此操作。');
		const report = await db.FundDocumentModel.findOnly({_id: reportId});
		report.disabled = type;
		await report.save();
		await next();
	});
module.exports = reportRouter;