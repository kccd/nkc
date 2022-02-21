const router = require("koa-router")();
router
  .get('/', async (ctx, next) => {
    ctx.template = 'columns/columnEditor.pug';
    await next();
  });
module.exports = router;
