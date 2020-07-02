const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		let {query, db, data} = ctx;
		let {uid} = query;
		data.scores = await db.UserModel.getUserScores(uid);
		return next();
  });

module.exports = router;