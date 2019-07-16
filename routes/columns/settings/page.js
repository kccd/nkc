const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {t, id} = query;
    const {column} = data;
    data.pageCount = await db.ColumnPageModel.count({columnId: column._id});
    data.columnSettings = await db.SettingModel.getSettings("column");
    if(t === "add") {
      ctx.template = "columns/settings/editPage.pug";
    } else if(t === "edit") {
      const page = await db.ColumnPageModel.findOne({columnId: column._id, _id: id});
      if(!page) ctx.throw(400, `ID为${id}的自定义页面不存在`);
      data.page = page;
      ctx.template = "columns/settings/editPage.pug";
    } else {
      data.pages = await db.ColumnPageModel.find({columnId: column._id}).sort({toc: -1});
      for(const page of data.pages) {
        page.c = nkcModules.apiFunction.obtainPureText(page.c, true, 200);
      }
      ctx.template = "columns/settings/page.pug";
    }
    data.highlight = "page";
    await next();
  });
module.exports = router;