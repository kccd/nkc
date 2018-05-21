const Router = require('koa-router');
const usersRouter = new Router();
usersRouter
	.get('/', async (ctx, next) => {
		const {data, query} = ctx;
		let {page} = query;
		const {role} = data;
		if(role._id === 'visitor') {
			return ctx.redirect(`/e/settings/role/visitor/base`);
		}
		if(page) {
			page = parseInt(page);
		} else {
			page = 0;
		}
		const count = await role.extendUserCount();
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		data.users = await role.getUsers(paging);
		await next();
	});
module.exports = usersRouter;