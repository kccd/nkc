const Router = require('koa-router');
const router = new Router();

router
  .use('/z', async (ctx, next) => {
    ctx.data.navbar_highlight = 'zone';
    await next();
  })
  .use(['/c', '/f', '/t', '/p'], async (ctx, next) => {
    ctx.data.navbar_highlight = 'community';
    await next();
  })
  .use(['/m', '/column'], async (ctx, next) => {
    ctx.data.navbar_highlight = 'columns';
    await next();
  })
  .use(['/apps', '/fund', '/tools'], async (ctx, next) => {
    ctx.data.navbar_highlight = 'apps';
    await next();
  });

module.exports = router;
