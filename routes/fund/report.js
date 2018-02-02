const Router = require('koa-router');
const reportRouter = new Router();
reportRouter
	.use('/', async (ctx, next) => {
		const {user, applicationForm} = ctx.data;
		if(applicationForm.uid !== user.uid) ctx.throw(401, '权限不足');
		await next();
	})
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user, applicationForm} = data;
		if(applicationForm.uid !== user.uid) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_report.pug';
		data.reports = await db.FundDocumentModel.find({uid: user.uid, type: 'report', applicationFormId: applicationForm._id, disabled: false}).sort({toc: -1});
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user, applicationForm} = data;
		const {c, type, selectedThreads} = body;
		if(type === 'applyRemittance') {
			const {remittance} = applicationForm;
			for(let r of remittance) {
				if(!r.status) {
					if(r.needThreads && selectedThreads.length === 0) ctx.throw(400, '管理员要求提交汇款申请必须要附带代表中期报告的帖子。');
					r.threads = selectedThreads;
					r.status = null;
					const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
					const newDocument = db.FundDocumentModel({
						_id: newId,
						uid: user.uid,
						type: 'report',
						applicationFormId: applicationForm._id,
						c: c,
					});
					await newDocument.save();
					await applicationForm.update({remittance});
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
		await next();
	});
module.exports = reportRouter;