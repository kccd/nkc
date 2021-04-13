const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    let {page=0, c, t} = query;
    let noopReturn = false;
    if(c) {
      c = JSON.parse(decodeURIComponent(Buffer.from(c, "base64").toString()));
      data.openDeleteEntry = true;
    } else {
      c = {};
      if(t === "cleanup") noopReturn = true;
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
      const asUsername = await db.UserModel.findOne({usernameLowerCase: c.uid.toLowerCase()}, {uid: 1});
      const asUserId = await db.UserModel.findOne({uid: c.uid}, {uid: 1});
      let userIdArr = [];
      if(asUsername) userIdArr.push(asUsername.uid);
      if(asUserId) userIdArr.push(asUserId.uid);
      searchMap.uid = {
        $in: userIdArr
      };
    }
    if(c.operationId) {
      searchMap.operationId = c.operationId;
    }
    let logType = c.logType || "user";
    data.c = encodeURIComponent(Buffer.from(JSON.stringify(c)).toString('base64'));
    let paging;
    data.result = [];
    if(!noopReturn) {
      if(t !== "visitor" && logType === "user") {
        const count = await db.LogModel.countDocuments(searchMap);
        paging = nkcModules.apiFunction.paging(page, count, 60);
        const logs = await db.LogModel.find(searchMap).sort({reqTime:-1}).skip(paging.start).limit(paging.perpage);
        data.result = await Promise.all(logs.map(async behavior => {
          await behavior.extendUser();
          return behavior;
        }));
      } else {
        // 游客
        const count = await db.VisitorLogModel.countDocuments(searchMap);
        paging = nkcModules.apiFunction.paging(page, count, 60);
        data.result = await db.VisitorLogModel.find(searchMap).sort({reqTime:-1}).skip(paging.start).limit(paging.perpage);
      }
    }
    data.t = t;
    data.searchMap = c;
    data.searchMap.logType = logType;
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
        {"reqTime": {}}
      ]
    };
    if(del.sTime) {
      delMap.$and[0].reqTime.$gt = new Date(del.sTime);
    }
    if(del.eTime) {
      delMap.$and[0].reqTime.$lt = new Date(del.eTime);
    }

    if(del.logType === "user") {
      await db.LogModel.deleteMany(delMap);
    }else if(del.logType === "visitor") {
      await db.VisitorLogModel.deleteMany(delMap);
    }

    await next();
  });
module.exports = router;
