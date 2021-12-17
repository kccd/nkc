const router = require('koa-router')();
router
  .get('/creator', async (ctx, next) => {
    await next();
  })
  .post('/creator', async (ctx, next) => {
    const {body} = ctx;
    const {files, fields} = body;
    const article = JSON.parse(fields.article);
    const {cover} = files;
    await next();
  });
module.exports = router;