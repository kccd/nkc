const Router = require('koa-router');
const memberRouter = new Router();
memberRouter
	.patch('/', async (ctx, next) => {
		const {data, body} = ctx;
		const {user, applicationForm} = data;
		const {agree} = body;
		const {members} = applicationForm;
		for (let u of members) {
			if(u.agree === null && user.uid === u.uid) {
				await u.update({agree})
			}
		}
		await next();
	});
module.exports = memberRouter;