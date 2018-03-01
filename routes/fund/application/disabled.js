const Router = require('koa-router');
const disabledRouter = new Router();
disabledRouter
	.patch('/', async (ctx, next) => {
		const {data, body} = ctx;
		const {applicationForm, user} = data;
		if(!applicationForm.fund.ensureOperatorPermission('admin', user)) ctx.throw(401, '抱歉！您没有权限进行屏蔽操作。');
		const {type} = body;
		applicationForm.disabled = type;
		await applicationForm.save();
		await next();
	});
module.exports = disabledRouter;