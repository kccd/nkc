const Router = require("koa-router");
const router = new Router();
const columnRouter = require("./column");

router
  .get("/", async (ctx, next) => {
    const {query, data, db} = ctx;
    const {page = 0} = query;
    let {t} = query;
    const match = {};
    const columnSettings = await db.SettingModel.getSettings('column');
    if(!ctx.permission('column_single_disabled')) {
      match.closed = false;
      match.disabled = false;
    }
    match.postCount = {$gte: columnSettings.columnHomePostCountMin};
    const count = await db.ColumnModel.countDocuments(match);
    const paging = ctx.nkcModules.apiFunction.paging(page, count);
    const sort = {};
    if(t === undefined) {
      if(columnSettings.columnHomeSort === 'updateTime') {
        t = 'l';
      } else {
        t = 's';
      }
    }
    if(t === 'l') {
      sort.tlm = -1;
    } else if(t === 's'){
      sort.subCount = -1;
    } else {
      sort.postCount = -1;
    }
    data.columns = await db.ColumnModel.find(match)
      .sort(sort)
      .skip(paging.start)
      .limit(paging.perpage);
    ctx.template = 'columns/columns.pug';
    data.t = t;
    data.paging = paging;
    await next();
  })
  .use("/:_id", columnRouter.routes(), columnRouter.allowedMethods());
module.exports = router;
