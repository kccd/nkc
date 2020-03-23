const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    let {page=0, c, t} = query;
    if(c) {
      c = JSON.parse(decodeURIComponent(Buffer.from(c, "base64").toString()));
      data.openDeleteEntry = true;
    } else {
      c = {};
    }
    data.c = c;
    data.t = t;
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
  .del('/', async (ctx, next) => {
    const {db, query} = ctx;
    let {del} = query;
    del = del? JSON.parse(decodeURIComponent(Buffer.from(del, "base64").toString())) : {};
    const delMap = {
      "$and":[
        {"reqTime": {}},
        // {"uid": uid},
        // {"ip": ip}
      ]
    };
    if(del.sTime) {
      delMap.$and[0].reqTime.$gt = new Date(del.sTime);
    }
    if(del.eTime) {
      delMap.$and[0].reqTime.$lt = new Date(del.eTime);
    }
    if(del.ip) {
      delMap.$and[1].ip =  del.ip;
    }
    if(del.uid) {
      delMap.$and[2].uid =  del.uid;
    }
    await db.LogModel.remove(delMap);
    
    await next();
  });
module.exports = router;