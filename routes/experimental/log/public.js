const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, type} = query;
    const count = await db.LogModel.count({});
		const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging
    // data.result = await db.LogModel.find({}).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    const logs = await db.LogModel.find({}).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    data.result = await Promise.all(logs.map(async behavior => {
			await behavior.extendUser();
			return behavior;
		}));
    ctx.template = 'experimental/log/public.pug';
    await next()
  })
  .del('/', async(ctx, next) => {
    const {db, query} = ctx;
    const startTime = query.startTime !== ""?Date(query.startTime) : "";
    const endTime = query.endTime !== ""?Date(query.endTime) : "";
    const ip = query.ip !== ""?query.ip : "";
    const uid = query.uid !== ""?query.uid : "";
    const delMap = {
      "$or":[
        {"reqTime": {"$gt": startTime, "$lt": endTime}},
        {"uid": uid},
        {"ip": ip}
      ]
    }
    const logCount = await db.LogModel.remove(delMap)
    await next();
  })
module.exports = router;