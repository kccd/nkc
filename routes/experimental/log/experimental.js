const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, type} = query;
    const count = await db.ManageBehaviorModel.count({});
		const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging
    // data.result = await db.LogModel.find({}).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    const logs = await db.ManageBehaviorModel.find({}).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    data.result = await Promise.all(logs.map(async behavior => {
      if(behavior.para.disabled && behavior.para.disabled === true){
        behavior.manageName = "屏蔽回复"
      }else if(behavior.para.disabled === false){
        behavior.manageName = "解除屏蔽回复"
      }
      await behavior.extendUser();
      await behavior.extendToUser();
      await behavior.extendOperationName();
			return behavior;
    }));
    ctx.template = 'experimental/log/manage.pug';
    await next()
  })
module.exports = router;