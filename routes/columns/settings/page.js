const Router = require("koa-router");
const router = new Router();
const serverConfig = require("../../../config/server");
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {t, id} = query;
    const {column} = data;
    data.pageCount = await db.ColumnPageModel.countDocuments({columnId: column._id});
    data.columnSettings = await db.SettingModel.getSettings("column");
    data.pageUrl = `${serverConfig.domain}/m/${column._id}/page/`;
    if(t === "add") {
      ctx.template = "columns/settings/editPage.pug";
    } else if(t === "edit") {
      const page = await db.ColumnPageModel.findOne({columnId: column._id, _id: id});
      if(!page) ctx.throw(400, `未找到ID为${id}的自定义页面`);
      data.page = page;
      ctx.template = "columns/settings/editPage.pug";
    } else {
      data.pages = await db.ColumnPageModel.find({columnId: column._id}).sort({toc: -1});
      for(const page of data.pages) {
        page.c = nkcModules.nkcRender.htmlToPlain(page.c, 200);
      }
      ctx.template = "columns/settings/page.pug";
    }
    data.nav = "page";
    await next();
  });
module.exports = router;