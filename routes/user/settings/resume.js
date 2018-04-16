const Router = require('koa-router');
const resumeRouter = new Router();
resumeRouter
	.get('/', async  (ctx, next) => {
		ctx.template = 'interface_user_settings_resume.pug';
		await next();
	});
module.exports = resumeRouter;