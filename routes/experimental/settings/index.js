const Router = require('koa-router');
const settingRouter = new Router();
const forumRouter = require('./forum');
const baseRouter = require('./base');
const roleRouter = require('./role');
const userRouter = require('./user');
const scoreRouter = require('./score');
const operationRouter = require('./operation');
const downloadRouter = require('./download');
const gradeRouter = require('./grade');
const kcbRouter = require('./kcb');
const logRouter = require('./log');
const numberRouter = require('./number');
const homeRouter = require('./home');
const pageRouter = require('./page');
const examRouter = require('./exam');
const messageRouter = require('./message');
const smsRouter = require('./sms');
const postRouter = require('./post');
settingRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.post('/', async (ctx, next) => {
		await next();
	})
	.use('/post', postRouter.routes(), postRouter.allowedMethods())
	.use('/message', messageRouter.routes(), messageRouter.allowedMethods())
	.use('/sms', smsRouter.routes(), smsRouter.allowedMethods())
	.use('/home', homeRouter.routes(), homeRouter.allowedMethods())
	.use('/page', pageRouter.routes(), pageRouter.allowedMethods())
	.use('/number', numberRouter.routes(), numberRouter.allowedMethods())
	.use('/score', scoreRouter.routes(), scoreRouter.allowedMethods())
	.use('/kcb', kcbRouter.routes(), kcbRouter.allowedMethods())
	.use('/grade', gradeRouter.routes(), gradeRouter.allowedMethods())
	.use('/download', downloadRouter.routes(), downloadRouter.allowedMethods())
	.use('/role', roleRouter.routes(), roleRouter.allowedMethods())
	.use('/base', baseRouter.routes(), baseRouter.allowedMethods())
  .use('/operation', operationRouter.routes(), operationRouter.allowedMethods())
  .use('/log', logRouter.routes(), logRouter.allowedMethods())
	.use('/user', userRouter.routes(), userRouter.allowedMethods())
	.use('/exam', examRouter.routes(), examRouter.allowedMethods())
	.use('/forum', forumRouter.routes(), forumRouter.allowedMethods());
module.exports = settingRouter;