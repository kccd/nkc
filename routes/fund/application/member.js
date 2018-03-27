const Router = require('koa-router');
const memberRouter = new Router();
memberRouter
	.patch('/', async (ctx, next) => {
		const {data, body} = ctx;
		const {user, applicationForm} = data;
		const {agree} = body;
		const {lock, members, useless, disabled} = applicationForm;
		if(disabled) ctx.throw(400, '申请表已被屏蔽。');
		if(useless !== null) ctx.throw(400, '申请表已失效，无法完成该操作。');
		if(lock.submitted) ctx.throw(400, '申请表已提交，无法完成该操作。');
		for (let u of members) {
			if(u.agree === null && user.uid === u.uid) {
				await u.update({agree})
			}
		}
		await next();
	});
module.exports = memberRouter;