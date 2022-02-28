const router = require("koa-router")();
router
  .get('/', async (ctx, next) => {
    const {db, data, query, state} = ctx;
    ctx.template = 'columns/columnEditor.pug';
    data.column = {
        userColumn: state.userColumn,
        columnPermission: state.columnPermission,
        addedToColumn: state.addedToColumn
    };
    // 取网站代号
    let serverSetting = await db.SettingModel.getSettings("server");
    data.websiteCode = String(serverSetting.websiteCode).toLocaleUpperCase();
    await next();
  });
module.exports = router;
