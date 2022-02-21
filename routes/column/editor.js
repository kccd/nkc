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
    await next();
  });
module.exports = router;
