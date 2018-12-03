const addRouter = require('./add');
const listRouter = require('./list');
const typeRouter = require('./type');
const Router = require('koa-router');
const problemRouter = new Router();
problemRouter
	.use('/list', listRouter.routes(), listRouter.allowedMethods())
  .use('/type', typeRouter.routes(), typeRouter.allowedMethods())
	.use('/add', addRouter.routes(), addRouter.allowedMethods());
module.exports = problemRouter;