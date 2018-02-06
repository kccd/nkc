const Router = require('koa-router');
const completeRouter = new Router();
completeRouter
	.use('/', async (ctx, next) => {
		const {data} = ctx;
		const {user, applicationForm} = data;
		const {status, remittance} = applicationForm;
		if(user.uid !== applicationForm.uid) ctx.throw('权限不足');
		if(!status.remittance) ctx.throw(400, '当前暂未汇款，暂不能结项。若想取消申请，请点击放弃申请按钮。');
		for(let r of remittance) {
			if(!r.status) ctx.throw(400, '当前还未全部汇款，暂不能结项。若想取消申请，请点击放弃申请按钮。');
		}
		if(status.completed) ctx.throw('该项目已结项。');
		await next();
	})
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_fund_complete.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {applicationForm, user} = data;
		const {c, selectedThreads, successful} = body;
		const {timeToPassed} = applicationForm;

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
			type: 'report',
			c
		});
		applicationForm.threadsId.completed = selectedThreads.map(t => t.tid);
		applicationForm.status.completed = true;
		applicationForm.status.successful = successful;
		await newDocument.save();
		await applicationForm.save();
		await next();
	});
module.exports = completeRouter;
