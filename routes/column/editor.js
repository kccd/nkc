const router = require("koa-router")();
router
  .get('/', async (ctx, next) => {
    const {db, data, query, state} = ctx;
    ctx.template = 'columns/columnEditor.pug';
    await next();
  });
module.exports = router;
