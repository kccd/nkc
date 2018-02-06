const Router = require('koa-router');
const commentRouter = new Router();
commentRouter
	.post('/', async (ctx, next) => {
		const {data, body} = ctx;
		const {applicationForm, user} = data;
		if(applicationForm.disabled) ctx.throw(401, '抱歉！该申请表已被管理员封禁。');
		const {comment} = body;
		if(!applicationForm.status.submitted) ctx.throw(400, '申请表未提交，暂不能评论。');
		await applicationForm.newComment({
			uid: user.uid,
			c: comment.c,
			t: comment.t,
		});
		await next();
	});
module.exports = commentRouter;