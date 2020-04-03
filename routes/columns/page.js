const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const pageCount = await db.ColumnPageModel.count({columnId: column._id});
    const columnSettings = await db.SettingModel.getSettings("column");
    if(pageCount >= columnSettings.pageCount) ctx.throw(400, `最多允许创建${columnSettings.pageCount}个自定义页面`);
    const {title, content} = body;
    if(!content) ctx.throw(400, "页面内容不能为空");
    const page = db.ColumnPageModel({
      _id: await db.SettingModel.operateSystemID("columnPages", 1),
      columnId: column._id,
      t: title,
      c: content
    });
    await page.save();
    data.page = page;
    await db.ColumnPageModel.toSearch(page._id);
    await next();
  })
  .patch("/:pageId", async (ctx, next) => {
    const {data, db, body, params} = ctx;
    const {column, user} = data;
    const {pageId} = params;
    const {type} = body;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const page = await db.ColumnPageModel.findOne({columnId: column._id, _id: pageId});
    if(!page) ctx.throw(400, `未找到ID为${pageId}的自定义页面`);
    if(type === "modifyContent") {
      const {title, content} = body;
      if(!content) ctx.throw(400, "页面内容不能为空");
      page.t = title;
      page.c = content;
      page.tlm = Date.now();
      await page.save();
      await db.ColumnPageModel.toSearch(page._id);
    } else if(type === "hide") {
      let {hidden} = body;
      hidden = !!hidden;
      await page.update({
        hidden
      });
    } else if(type === "toNav") {
      const {links} = column;
      let added = false;
      for(const link of links) {
        if(link.url === url) {
          added = true;
          break;
        }
      }
      if(!added) {
        await column.update({
          $addToSet: {
            links: {
              name: page.t || "新建导航",
              url
            }
          }
        });
      }
    }
    data.page = page;
    await next();
  })
  .del("/:pageId", async (ctx, next) => {
    const {data, db, params} = ctx;
    const {column, user} = data;
    const {pageId} = params;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const page = await db.ColumnPageModel.findOne({columnId: column._id, _id: pageId});
    if(!page) ctx.throw(400, `未找到ID为${pageId}的自定义页面`);
    await page.remove();
    await next();
  })
  .get("/:pageId", async (ctx, next) => {
    const {data, db, params, nkcModules} = ctx;
    const {pageId} = params;
    const {column, user} = data;
    data.column = await column.extendColumn();
    const page = await db.ColumnPageModel.findOne({columnId: column._id, _id: pageId});
    if(!page) ctx.throw(404, `未找到ID为${pageId}的自定义页面`);
    if(page.hidden && (!user || column.uid !== user.uid)) ctx.throw(403, "该页面已被专栏主关闭");
    data.pageContent = nkcModules.nkcRender.htmlToPlain(page.c, 150);
    page.c = nkcModules.nkcRender.renderHTML({
      type: 'article',
      post: {
        c: page.c,
        resources: await db.ResourceModel.getResourcesByReference(`column-${pageId}`)
      },
      user: data.user
    });
    data.page = page;
    data.navCategories = await db.ColumnPostCategoryModel.getColumnNavCategory(column._id);
    data.categories = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    data.timeline = await db.ColumnModel.getTimeline(column._id);
    ctx.template = "columns/page.pug";
    await next();
  });
module.exports = router;