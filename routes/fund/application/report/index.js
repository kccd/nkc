const Router = require('koa-router');
const auditRouter = require('./audit');
const reportRouter = new Router();
reportRouter
	.use('/', async (ctx, next) => {
		const {applicationForm, fund, state} = ctx.data;
		if(!applicationForm.status.adminSupport) ctx.throw(400, '暂未通过管理员复核，请通过后再试');
		if(applicationForm.useless !== null) ctx.throw(403,'申请表已被失效');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, state} = ctx;
		const {applicationForm, fund} = data;
		if(state.uid !== applicationForm.uid) ctx.throw(403, `权限不足`);
		data.nav = '项目进度';
		await applicationForm.extendReports(await fund.isFundRole(state.uid, 'admin'));
    ctx.template = 'fund/report/report.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, state} = ctx;
		const {user, applicationForm} = data;
		const {c, t, l} = body;
    if(state.uid !== applicationForm.uid) ctx.throw(403, `权限不足`);
		if(applicationForm.status.completed) ctx.throw(400, '项目已经结题，无法再提交报告');
		await applicationForm.createReport('report', c, state.uid);
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
	})
  .use('/audit', auditRouter.routes(), auditRouter.allowedMethods());
module.exports = reportRouter;