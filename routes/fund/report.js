const Router = require('koa-router');
const reportRouter = new Router();
reportRouter
	.use('/', async (ctx, next) => {
		const {user, applicationForm} = ctx.data;
		if(applicationForm.uid !== user.uid) ctx.throw(401, '权限不足');
		if(!applicationForm.status.adminSupport) ctx.throw(400, '暂未通过管理员审核，请通过后再试。');
		if(applicationForm.status.completed) ctx.throw(400, '该项目已结项。');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user, applicationForm} = data;
		if(applicationForm.uid !== user.uid) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_report.pug';
		data.reports = await db.FundDocumentModel.find({uid: user.uid, type: 'report', applicationFormId: applicationForm._id, disabled: false}).sort({toc: -1});
		data.reportAudit = await db.FundDocumentModel.findOne({type: 'reportAudit'}).sort({toc: -1});
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user, applicationForm} = data;
		const {c, type, selectedThreads} = body;
		const obj = {};
		if(type === 'applyRemittance') {
			const {timeToPassed, reportNeedThreads, remittance} = applicationForm;
			for(let r of remittance) {
				if(!r.status) {
					if(reportNeedThreads && selectedThreads.length === 0) ctx.throw(400, '管理员要求提交汇款申请必须要附带代表中期报告的帖子。');

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
				applicationFormId: applicationForm._id,
				type: 'report'
			});
			await newDocument.save();
		}
		await applicationForm.update(obj);
		await next();
	})
	.get('/audit', async (ctx, next) => {
		const {data, db} = ctx;
		data.type = 'reportAudit';
		const {userLevel, applicationForm, user} = data;
		const {remittance, reportNeedThreads, submittedReport} = applicationForm;
		if(userLevel < 7) ctx.throw('权限不足');
		if(!submittedReport) ctx.throw(400, '申请人暂未提交报告。');
		if(reportNeedThreads) {
			for(let r of remittance) {
				if(r.status === null && r.passed === null && r.threads && r.threads.length !== 0){
					data.threads = await Promise.all(r.threads.map(async t => {
						const thread = await db.ThreadModel.findOnly({tid: t});
					  await thread.extendFirstPost().then(p => p.extendUser());
					  return thread;
					}));
					data.report = await db.FundDocumentModel.findOnly({_id: r.report});
					break;
				}
			}
		}
		ctx.template = 'interface_fund_report.pug';
		await next();
	})
	.post('/audit', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {applicationForm, user} = data;
		const {submittedReport, remittance} = applicationForm;
		const {support, c} = body;
		if(!submittedReport) ctx.throw(400, '申请人暂未提交报告。');
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