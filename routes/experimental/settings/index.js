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
const appRouter = require('./app');
const pageRouter = require('./page');
const examRouter = require('./exam');
const messageRouter = require('./message');
const shareRouter = require('./share');
const smsRouter = require('./sms');
const postRouter = require('./post');
const xsfRouter = require('./xsf');
const redEnvelopeRouter = require('./redEnvelope');
const emailRouter = require('./email');
const shopRouter = require('./shop');
settingRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.post('/', async (ctx, next) => {
		await next();
	})
  .use('/red-envelope', redEnvelopeRouter.routes(), redEnvelopeRouter.allowedMethods())
  .use('/xsf', xsfRouter.routes(), xsfRouter.allowedMethods())
	.use('/post', postRouter.routes(), postRouter.allowedMethods())
	.use('/message', messageRouter.routes(), messageRouter.allowedMethods())
	.use('/share', shareRouter.routes(), shareRouter.allowedMethods())
	.use('/sms', smsRouter.routes(), smsRouter.allowedMethods())
	.use('/home', homeRouter.routes(), homeRouter.allowedMethods())
	.use('/app', appRouter.routes(), appRouter.allowedMethods())
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
  .use('/email', emailRouter.routes(), emailRouter.allowedMethods())
	.use('/forum', forumRouter.routes(), forumRouter.allowedMethods())
	.use('/shop', shopRouter.routes(), shopRouter.allowedMethods());
module.exports = settingRouter;