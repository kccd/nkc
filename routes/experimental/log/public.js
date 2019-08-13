const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    let {page=0, c, t} = query;
    data.c = c;
    data.t = t;
    if(c) {
      c = JSON.parse(decodeURIComponent(Buffer.from(c, "base64").toString()));
    } else {
      c = {};
    }
    const searchMap = {};
    if(c.sTime || c.eTime) {
      searchMap.reqTime = {};
      if(c.sTime) searchMap.reqTime.$gte = c.sTime;
      if(c.eTime) searchMap.reqTime.$lt = c.eTime;
    }
    if(c.ip) {
      searchMap.ip = c.ip;
    }
    if(c.uid) {
      searchMap.uid = c.uid;
    }
    if(c.operationId) {
      searchMap.operationId = c.operationId;
    }
    let paging;
    if(!t) {
      const count = await db.LogModel.count(searchMap);
      paging = nkcModules.apiFunction.paging(page, count, 60);
      const logs = await db.LogModel.find(searchMap).sort({reqTime:-1}).skip(paging.start).limit(paging.perpage);
      data.result = await Promise.all(logs.map(async behavior => {
        await behavior.extendUser();
        return behavior;
      }));
    } else {
      const count = await db.VisitorLogModel.count(searchMap);
      paging = nkcModules.apiFunction.paging(page, count, 60);
      data.result = await db.VisitorLogModel.find(searchMap).sort({reqTime:-1}).skip(paging.start).limit(paging.perpage);
    }
    data.searchMap = c;
    data.paging = paging;
    ctx.template = 'experimental/log/public.pug';
    await next()
  })
  .del('/', async(ctx, next) => {
    const {db, query} = ctx;
    const sTime = query.sTime !== ""?Date(query.sTime) : "";
    const eTime = query.eTime !== ""?Date(query.eTime) : "";
    const ip = query.ip !== ""?query.ip : "";
    const uid = query.uid !== ""?query.uid : "";
    const delMap = {
      "$or":[
        {"reqTime": {"$gt": sTime, "$lt": eTime}},
        {"uid": uid},
        {"ip": ip}
      ]
    }
    const logCount = await db.LogModel.remove(delMap)
    await next();
  })
module.exports = router;