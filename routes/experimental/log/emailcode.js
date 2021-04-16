const router = require('koa-router')();

router
  .get("/", async (ctx, next) => {
    const { db, nkcModules, query, data } = ctx;
    let { page = 0, c } = query;
    c =  c? JSON.parse(decodeURIComponent(Buffer.from(c, "base64").toString())) : {};
    let searchMap = {};
    if(c.sTime) {
      if(!searchMap.toc) searchMap.toc = {};
      searchMap.toc.$gt = new Date(c.sTime);
    }
    if(c.eTime) {
      if(!searchMap.toc) searchMap.toc = {};
      searchMap.toc.$lt = new Date(c.eTime);
    }
    if(c.optype) {
      searchMap.type = c.optype;
    }
    if(c.userid) {
      searchMap.uid = c.userid;
    }
    if(c.emailAddr) {
      searchMap.email = c.emailAddr;
    }
    let count = await db.EmailCodeModel.countDocuments(searchMap);
    let paging = nkcModules.apiFunction.paging(page, count, 40);
    let result = await db.EmailCodeModel
      .find(searchMap)
      .sort({toc:-1})
      .skip(paging.start)
      .limit(paging.perpage);
    result = await Promise.all(result.map(async record => {
      record.user = await db.UserModel.findOne({uid: record.uid});
      return record;
    }));
    data.result = result;
    data.paging = paging;
    data.repc = c;
    data.c = encodeURIComponent(new Buffer(JSON.stringify(c)).toString('base64'));
    ctx.template = "experimental/log/emailcode.pug";
    await next();
  })

module.exports = router;