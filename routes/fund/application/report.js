const Router = require('koa-router');
const reportRouter = new Router();
reportRouter
	.use('/', async (ctx, next) => {
		const {applicationForm} = ctx.data;
		if(!applicationForm.status.adminSupport) ctx.throw(400, '暂未通过管理员复核，请通过后再试。');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {applicationForm} = data;
		ctx.template = 'interface_fund_report.pug';
		data.reports = await db.FundDocumentModel.find({type: {$in: ['report', 'completedReport']}, applicationFormId: applicationForm._id, disabled: false}).sort({toc: -1});

		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user, applicationForm} = data;
		const {c, t, type, selectedThreads} = body;
		if(applicationForm.status.completed) ctx.throw(400, '该项目已结项。');
		const obj = {};
		if(user.uid !== applicationForm.uid) ctx.throw(403, '权限不足');
		if(type === 'applyRemittance') {
			if(applicationForm.status.completed) ctx.throw(400, '抱歉！该申请已经完结。');
			const {timeToPassed, reportNeedThreads, remittance} = applicationForm;
			for(let r of remittance) {
				if(!r.status) {
					if(reportNeedThreads && selectedThreads.length === 0) ctx.throw(400, '管理员要求提交拨款申请必须要附带代表中期报告的帖子。');

					//验证帖子时间
					await Promise.all(selectedThreads.map(async t => {
						const thread = await db.ThreadModel.findOnly({tid: t.tid});
						if(thread.toc < timeToPassed) ctx.throw(400, '请选择申请项目之后所发的帖子。')
					}));

					r.threads = selectedThreads.map(t => t.tid);
					r.passed = null;
					const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
					r.report = newId;
					const newDocument = db.FundDocumentModel({
						_id: newId,
						uid: user.uid,
						type: 'report',
						applicationFormId: applicationForm._id,
						c: c,
					});
					await newDocument.save();
					obj.remittance = remittance;
					obj.submittedReport = true;
					break;
				}
			}
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
		await applicationForm.update(obj);
		await next();
	})
	.get('/audit', async (ctx, next) => {
		const {data, db} = ctx;
		data.type = 'reportAudit';
		const {user, applicationForm} = data;
		const {remittance, reportNeedThreads, submittedReport, fund} = applicationForm;
		const {certs, appointed} = fund.censor;
		let isCensor = false;
		for(let c of certs) {
			if(user.certs.includes(c)) isCensor = true;
		}
		if(appointed.includes(user.uid)) isCensor = true;
		if(!isCensor) ctx.throw(401, '权限不足');
		if(!submittedReport) ctx.throw(400, '申请人暂未提交报告。');
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
		const {certs, appointed} = fund.censor;
		let isCensor = false;
		for(let c of certs) {
			if(user.certs.includes(c)) isCensor = true;
		}
		if(appointed.includes(user.uid)) isCensor = true;
		if(!isCensor) ctx.throw(401, '权限不足');
		const {number, support, c} = body;
		if(!number) ctx.throw(400, '参数错误');
		if(!submittedReport) ctx.throw(400, '申请人暂未提交报告。');
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
		for(let r of remittance) {
			if(r.status === null && r.passed === null) {
				r.passed = support;
				await applicationForm.update({remittance, submittedReport: false});
				break;
			}
		}
		await next();
	});
module.exports = reportRouter;