const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    await next();
  })
  .get('/creator', async (ctx, next) => {
    await next();
  })
  .post('/creator', async (ctx, next) => {
    const {body} = ctx;
    const {files, fields} = body;
    console.log(body);
    await next();
  });
module.exports = router;