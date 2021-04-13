const Router = require('koa-router');
const router = new Router();
router
	.post('/', async (ctx, next) => {
		const {db, params} = ctx;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
		await thread.updateOne({closed: true});
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, params} = ctx;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
		await thread.updateOne({closed: false});
		await next();
	});
module.exports = router;