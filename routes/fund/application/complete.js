const Router = require('koa-router');
const completeRouter = new Router();
completeRouter
	.use('/', async (ctx, next) => {
		const {data} = ctx;
		const {applicationForm} = data;
		const {status, useless, disabled} = applicationForm;
		if(disabled) ctx.throw(401, '申请表已被屏蔽。');
		if(useless !== null) ctx.throw('申请表已失效，无法完成该操作。');
		if(status.completed) ctx.throw('该项目已结项。');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user, applicationForm} = data;
		const {status, remittance} = applicationForm;
		for(let r of remittance) {
			if(r.status === true && !r.verify) {
				ctx.throw(400, '请先确认收款后再申请结题。');
			}
		}
		if(user.uid !== applicationForm.uid) ctx.throw('权限不足');
		ctx.template = 'interface_fund_complete.pug';
		if(status.completed === false) {
			data.auditComments = {};
			data.auditComments.completedAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'completedAudit', disabled: false}).sort({toc: -1});
			data.completedReport = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'completedReport', disabled: false}).sort({toc: -1});
		}
		data.nav = '申请结题';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {applicationForm, user} = data;
		const {actualMoney, c, selectedThreads, successful} = body;
		const {fixedMoney, timeToPassed, remittance} = applicationForm;
		for(let r of remittance) {
			if(r.status === true && !r.verify) {
				ctx.throw(400, '请先确认收款后再申请结题。');
			}
		}
		if(user.uid !== applicationForm.uid) ctx.throw('权限不足');
		//验证帖子的时间
		await Promise.all(selectedThreads.map(async t => {
			const thread = await db.ThreadModel.findOnly({tid: t.tid});
			if(thread.toc < timeToPassed) ctx.throw(400, '请选择申请项目之后所发的帖子。');
		}));

		const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
		const newDocument = db.FundDocumentModel({
			_id: newId,
			uid: user.uid,
			applicationFormId: applicationForm,
			type: 'completedReport',
			c
		});

		const newReportId = await db.SettingModel.operateSystemID('fundDocuments', 1);
		const newReport = await db.FundDocumentModel({
			_id: newReportId,
			uid: user.uid,
			applicationFormId: applicationForm,
			type: 'system',
			c: '提交结题申请'
		});
		if(!fixedMoney) {
			if(actualMoney.length === 0) ctx.throw(400, '请输入实际使用金额。');
			await applicationForm.update({actualMoney});
		}
		applicationForm.threadsId.completed = selectedThreads.map(t => t.tid);
		applicationForm.status.successful = successful;
		applicationForm.timeOfCompleted = Date.now();
		applicationForm.completedAudit = true;
		applicationForm.status.completed = null;
		applicationForm.tlm = Date.now();
		await newDocument.save();
		await newReport.save();
		await applicationForm.save();
		await next();
	})
	.get('/audit', async (ctx, next) => {
		const {data, db} = ctx;
		const {applicationForm, user} = data;
		ctx.template = 'interface_fund_complete.pug';
		data.type = 'reportAudit';
		//结项审核  审查员权限判断
		const {fund, completedAudit} = applicationForm;
		if(!completedAudit) ctx.throw(401, '抱歉！申请人暂未提交结题申请。');
		if(!fund.ensureOperatorPermission('expert', user) && !fund.ensureOperatorPermission('admin', user)) ctx.throw(401, '抱歉！您没有资格进行结题审核。');
		data.report = await db.FundDocumentModel.findOne({type: 'completedReport'}).sort({toc: -1}).limit(1);
		data.nav = '结题审核';
		await next();
	})
	.post('/audit', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {applicationForm, user} = data;
		const {c, type} = body;
		//结项审核  审查员权限判断
		const {fund, completedAudit} = applicationForm;
		if(!completedAudit) ctx.throw(401, '抱歉！申请人暂未提交结题申请。');
		if(!fund.ensureOperatorPermission('expert', user) && !fund.ensureOperatorPermission('admin', user)) ctx.throw(401, '抱歉！您没有资格进行结题审核。');

		const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
		const newDocument = db.FundDocumentModel({
			_id: newId,
			c: c,
			type: 'completedAudit',
			support: (type === 'pass'),
			applicationFormId: applicationForm._id,
			uid: user.uid
		});
		await newDocument.save();
		if(type === 'pass') {
			await applicationForm.update({'status.completed': true, completedAudit: false, tlm: Date.now()});
		} else {
			await applicationForm.update({'status.completed': false, completedAudit: false});
		}
		await next();
	});
module.exports = completeRouter;
