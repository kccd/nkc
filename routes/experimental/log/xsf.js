const Router = require('koa-router');
const xsfRouter = new Router();
xsfRouter
  .get('/', async (ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    const {page = 0} = query;
    const count = await db.XsfsRecordModel.count();
    const paging = nkcModules.apiFunction.paging(page, count);
    const xsfsRecords = await db.XsfsRecordModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.xsfsRecords = await db.XsfsRecordModel.extendXsfsRecords(xsfsRecords);
    data.paging = paging;
    ctx.template = 'experimental/log/xsf.pug';
    await next();
  });
module.exports = xsfRouter;
