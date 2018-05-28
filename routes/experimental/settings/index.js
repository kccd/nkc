const Router = require('koa-router');
const settingRouter = new Router();
const forumRouter = require('./forum');
const baseRouter = require('./base');
const roleRouter = require('./role');
const userRouter = require('./user');
const scoreRouter = require('./score');
const operationRouter = require('./operation');
settingRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.post('/', async (ctx, next) => {
		await next();
	})
	.use('/score', scoreRouter.routes(), scoreRouter.allowedMethods())
	.use('/role', roleRouter.routes(), roleRouter.allowedMethods())
	.use('/base', baseRouter.routes(), baseRouter.allowedMethods())
	.use('/operation', operationRouter.routes(), operationRouter.allowedMethods())
	.use('/user', userRouter.routes(), userRouter.allowedMethods())
	.use('/forum', forumRouter.routes(), forumRouter.allowedMethods());
module.exports = settingRouter;