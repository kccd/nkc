const Router = require('koa-router');
const excellentRouter = new Router();
excellentRouter
	.patch('/', async (ctx, next) =>{
		const {data, body} = ctx;
		const {applicationForm} = data;
		const {type} = body;
		applicationForm.status.excellent = type;
		await applicationForm.save();
		await next();
	});
module.exports = excellentRouter;