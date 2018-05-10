const Router = require('koa-router');
const permissionRouter = new Router();
permissionRouter
	.get('/', async (ctx, next) => {
		const {data, allContentClasses} = ctx;
		data.allContentClasses = allContentClasses;
		ctx.template = 'interface_forum_settings_permission.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, body} = ctx;
		const {forum} = data;
		const {klass, accessible, displayOnParent, visibility, isVisibleForNCC} = body;
		await forum.update({class: klass, accessible, displayOnParent, visibility, isVisibleForNCC});
		await next();
	});
module.exports = permissionRouter;