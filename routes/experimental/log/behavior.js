const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, type} = query;
    const count = await db.UsersBehaviorModel.count({});
		const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging
    // data.result = await db.LogModel.find({}).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    const logs = await db.UsersBehaviorModel.find({}).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    data.result = await Promise.all(logs.map(async behavior => {
      await behavior.extendUser();
      await behavior.extendOperationName();
			return behavior;
		}));
    ctx.template = 'experimental/log/behavior.pug';
    await next()
  });
module.exports = router;