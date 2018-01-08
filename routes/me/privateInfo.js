const Router = require('koa-router');
const privateInfoRouter = new Router();
privateInfoRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		ctx.template = 'interface_user_privateInfo.pug';
		await next();
	});
module.exports = privateInfoRouter;