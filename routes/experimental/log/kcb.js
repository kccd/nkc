const Router = require('koa-router');
const kcbRouter = new Router();
kcbRouter
  .get('/', async (ctx, next) => {
    const {nkcModules, data, db, query} = ctx;
    const {page = 0} = query;
    const count = await db.KcbsRecordModel.count();
    const paging = nkcModules.apiFunction.paging(page, count);
    const kcbsRecords = await db.KcbsRecordModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.kcbsRecords = await db.KcbsRecordModel.extendKcbsRecords(kcbsRecords);
    data.kcbSettings = await db.SettingModel.findOnly({type: 'kcb'});
    data.paging = paging;
    ctx.template = 'experimental/log/kcb.pug';
    await next();
  });
module.exports = kcbRouter;