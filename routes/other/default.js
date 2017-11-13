const Router = require('koa-router');
const router = new Router();
const {accessSync} = require('fs');
const path = require('path');

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a filename is required.');
    await next()
  })
  .get('/:fileName', async (ctx, next) => {
    const {fileName} = ctx.params;
    ctx.filePath = String(path.resolve(__dirname, `../../resources/default/${fileName}`));
    await next()
  });

module.exports = router;