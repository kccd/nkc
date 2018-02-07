const Router = require('koa-router');
const disabledRouter = new Router();
disabledRouter
	.patch('/', async (ctx, next) => {
		const {data, body} = ctx;
		const {applicationForm} = data;
		const {type} = body;
		applicationForm.disabled = type;
		await applicationForm.save();
		await next();
	});
module.exports = disabledRouter;