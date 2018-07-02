const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, type} = query;
    let searchMap = {}
    if(type === "searchLog"){
      const startTime = query.startTime !== ""?new Date(query.startTime) : "";
      const endTime = query.endTime !== ""?new Date(query.endTime) : "";
      const ip = query.ip !== ""?query.ip : "";
      const uid = query.uid !== ""?query.uid : "";
      let searchLogMap = [{reqTime: {$gte: startTime, $lt: endTime}}]
      if(ip !== ""){
        searchLogMap.push({"ip": ip})
      }
      if(uid !== ""){
        searchLogMap.push({"uid": uid})
      }
      searchMap = {
        "$and":searchLogMap
      }
      data.type = "searchLog";
    }
    const count = await db.LogModel.count(searchMap);
		const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging
    // data.result = await db.LogModel.find({}).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    const logs = await db.LogModel.find(searchMap).sort({reqTime:-1}).skip(paging.start).limit(paging.perpage);
    data.result = await Promise.all(logs.map(async behavior => {
      await behavior.extendUser();
      await behavior.extendOperationName();
			return behavior;
    }));
    data.searchMap = {
      startTime: query.startTime?query.startTime:"",
      endTime: query.endTime?query.endTime:"",
      uid: query.uid?query.uid:"",
      ip: query.ip?query.ip:""
    };
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