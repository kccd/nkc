const Router = require('koa-router');
const commentRouter = new Router();
commentRouter
	.post('/', async (ctx, next) => {
		const {data, body, db} = ctx;
		const {applicationForm, user} = data;
		if(applicationForm.disabled) ctx.throw(401, '抱歉！该申请表已被管理员封禁。');
		const {comment} = body;
		if(!applicationForm.status.submitted) ctx.throw(400, '申请表未提交，暂不能评论。');
		const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
		const newDocument = db.FundDocumentModel({
			_id: newId,
			applicationFormId: applicationForm._id,
			uid: user.uid,
			type: 'comment',
			t: comment.t,
			c: comment.c
		});
		await newDocument.save();
		data.redirect = `/fund/a/${applicationForm._id}`;
		await next();
	});
module.exports = commentRouter;