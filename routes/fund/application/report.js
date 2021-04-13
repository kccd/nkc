const Router = require('koa-router');
const reportRouter = new Router();
reportRouter
	.use('/', async (ctx, next) => {
		const {applicationForm} = ctx.data;
		if(!applicationForm.status.adminSupport) ctx.throw(400, '暂未通过管理员复核，请通过后再试。');
		if(applicationForm.disabled) ctx.throw(403,'申请表已被屏蔽。');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {applicationForm, user} = data;
		ctx.template = 'interface_fund_report.pug';
		data.nav = '项目进度';
		const q = {
			type: {$in: ['report', 'completedReport', 'system', 'completedAudit', 'adminAudit', 'userInfoAudit', 'projectAudit', 'moneyAudit', 'remittance']},
			applicationFormId: applicationForm._id
		};
		if(!applicationForm.fund.ensureOperatorPermission('admin', user)) {
			q.disabled = false;
		}
		data.reports = await db.FundDocumentModel.find(q).sort({toc: -1});
		await Promise.all(data.reports.map(async r => {
			await r.extendUser();
			await r.extendResources();
		}));
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user, applicationForm} = data;
		const {c, t, l} = body;
		if(applicationForm.status.completed) ctx.throw(400, '抱歉！该申请已经结题。');
		if(applicationForm.useless !== null) ctx.throw(400, '申请表已失效，无法完成该操作。');
		if(user.uid !== applicationForm.uid) ctx.throw(403, '权限不足');
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
		await next();
	})
	.get('/audit', async (ctx, next) => {
		const {data, db} = ctx;
		data.type = 'reportAudit';
		data.nav = '报告审核';
		const {user, applicationForm} = data;
		const {remittance, reportNeedThreads, submittedReport, fund} = applicationForm;
		if(!fund.ensureOperatorPermission('expert', user)) ctx.throw(403,'抱歉！您没有资格进行报告审核。');
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
				data.report = await db.FundDocumentModel.findOne({_id: r.report});
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
		if(!fund.ensureOperatorPermission('expert', user)) ctx.throw(403,'抱歉！您没有资格进行报告审核。');
		const {number, support, c} = body;
		if(number === undefined) ctx.throw(400, '参数错误');
		if(!submittedReport) ctx.throw(400, '申请人暂未提交报告。');
		if(applicationForm.useless !== null) ctx.throw(400, '申请表已失效，无法完成该操作。');
		for(let i = 0; i < remittance.length; i++) {
			const r = remittance[i];
			if(!r.apply && i === number) ctx.throw(400, '申请人暂未提交报告。');
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
					str = `第 ${i+1} 期拨款申请未通过审核\n${c}`;
				}
				await applicationForm.updateOne({remittance, submittedReport: false});
				const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
				const newReport = db.FundDocumentModel({
					_id: newId,
					uid: user.uid,
					type: 'system',
					applicationFormId: applicationForm._id,
					c: str,
					support
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
		if(!applicationForm.fund.ensureOperatorPermission('admin', user)) ctx.throw(403,'抱歉！您不是该基金项目的管理员，无法完成此操作。');
		const report = await db.FundDocumentModel.findOnly({_id: reportId});
		report.disabled = type;
		await report.save();
		await next();
	});
module.exports = reportRouter;