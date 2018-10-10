const Router = require('koa-router');
const appRouter = new Router();
const historiesRouter = require('./histories');
// const topRouter = require('./top');
// const logoRouter = require('./logo');
const uploadRouter = require('./upload');
appRouter
	.use('/upload', uploadRouter.routes(), uploadRouter.allowedMethods())
	.use('/histories', historiesRouter.routes(), historiesRouter.allowedMethods());
	// .use('/logo', logoRouter.routes(), topRouter.allowedMethods())
	// .use('/top', topRouter.routes(), topRouter.allowedMethods());
module.exports = appRouter;