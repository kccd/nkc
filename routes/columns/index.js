const Router = require("koa-router");
const router = new Router();
const columnRouter = require("./column");

router
  .get("/", async (ctx, next) => {
    const {query, data, db} = ctx;
    const {page = 0} = query;
    const match = {};
    if(!ctx.permission('column_single_disabled')) {
      match.closed = false;
      match.disabled = false;
    }
    const count = await db.ColumnModel.count(match);
    const paging = ctx.nkcModules.apiFunction.paging(page, count);
    data.columns = await db.ColumnModel.find(match)
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    ctx.template = 'columns/columns.pug';
    data.paging = paging;
    await next();
  })
  .use("/:_id", columnRouter.routes(), columnRouter.allowedMethods());
module.exports = router;
