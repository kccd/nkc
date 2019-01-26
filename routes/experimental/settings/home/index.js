const Router = require('koa-router');
const homeRouter = new Router();
const topRouter = require('./top');
const logoRouter = require('./logo');
const noticeRouter = require('./notice');
const listRouter = require('./list');
homeRouter
  .use('/list', listRouter.routes(), listRouter.allowedMethods())
	.use('/notice', noticeRouter.routes(), noticeRouter.allowedMethods())
	.use('/logo', logoRouter.routes(), topRouter.allowedMethods())
	.use('/top', topRouter.routes(), topRouter.allowedMethods());
module.exports = homeRouter;