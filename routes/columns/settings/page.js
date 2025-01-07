const Router = require('koa-router');
const router = new Router();
const serverConfig = require('../../../config/server');
const { renderHTMLByJSON } = require('../../../nkcModules/nkcRender/json');
const { getJsonStringTextSlice } = require('../../../nkcModules/json');
const { OnlyUser } = require('../../../middlewares/permission');
router
  .use('/', OnlyUser(), async (ctx, next) => {
    const { db } = ctx;
    const { user, column } = ctx.data;
    const userPermissionObject =
      await db.ColumnModel.getUsersPermissionKeyObject();
    const isPermission = await db.ColumnModel.checkUsersPermission(
      column.users,
      user.uid,
      userPermissionObject.column_settings_page,
    );
    if (!isPermission && column.uid !== user.uid) {
      ctx.throw(403, '权限不足');
    }
    await next();
  })
  .get('/', OnlyUser(), async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    const { t, id } = query;
    const { column } = data;
    data.pageCount = await db.ColumnPageModel.countDocuments({
      columnId: column._id,
    });
    data.columnSettings = await db.SettingModel.getSettings('column');
    data.pageUrl = `${serverConfig.domain}/m/${column._id}/page/`;
    if (t === 'add') {
      ctx.template = 'columns/settings/editPage.pug';
    } else if (t === 'edit') {
      const page = await db.ColumnPageModel.findOne({
        columnId: column._id,
        _id: id,
      });
      if (!page) ctx.throw(400, `未找到ID为${id}的自定义页面`);
      data.page = page;
      ctx.template = 'columns/settings/editPage.pug';
    } else {
      data.pages = await db.ColumnPageModel.find({ columnId: column._id }).sort(
        { toc: -1 },
      );
      for (const page of data.pages) {
        page.c =
          page.l === 'json'
            ? getJsonStringTextSlice(page.c, 200)
            : nkcModules.nkcRender.htmlToPlain(page.c, 200);
      }
      ctx.template = 'columns/settings/page.pug';
    }
    data.nav = 'page';
    await next();
  });
module.exports = router;
