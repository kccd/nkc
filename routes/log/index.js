const Router = require('koa-router');
const logRouter = new Router();
const publicRouter = require('./public');
const infoRouter = require('./info');
const secretRouter = require('./secret');
const experimentalRouter = require('./experimental');
const behaviorRouter = require('./behavior');
logRouter
	.use('/public', publicRouter.routes(), publicRouter.allowedMethods())
	.use('/info', infoRouter.routes(), infoRouter.allowedMethods())
	.use('/experimental', experimentalRouter.routes(), experimentalRouter.allowedMethods())
	.use('/secret', secretRouter.routes(), secretRouter.allowedMethods())
	.use('/behavior', behaviorRouter.routes(), behaviorRouter.allowedMethods())
module.exports = logRouter;