const Router = require('koa-router');
const completeRouter = new Router();
const auditRouter = require('./audit');
completeRouter
	.use('/', async (ctx, next) => {
		const {data} = ctx;
		const {applicationForm} = data;
		const {status, useless, disabled} = applicationForm;
		if(disabled) ctx.throw(403,'申请表已被屏蔽');
		if(useless !== null) ctx.throw('申请表已失效，无法完成该操作');
		if(status.completed) ctx.throw('该项目已结题');
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
		if(status.completed === false) {
			data.auditComments = {};
			data.auditComments.completedAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'completedAudit', disabled: false}).sort({toc: -1});
			data.completedReport = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'completedReport', disabled: false}).sort({toc: -1});
		}
		if(ctx.query.new) {
		  ctx.template = 'fund/complete/complete.pug';
    } else {
      ctx.template = 'interface_fund_complete.pug';
    }
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
			await applicationForm.updateOne({actualMoney});
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
		await db.MessageModel.sendFundMessage(applicationForm._id, "expert");
		await next();
	})
  .use('/audit', auditRouter.routes(), auditRouter.allowedMethods());
module.exports = completeRouter;
