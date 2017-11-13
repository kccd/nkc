const Router = require('koa-router');
const router = new Router();
const {accessSync} = require('fs');
const path = require('path');

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a filename is required.');
    await next()
  })
  .get('/:file', async (ctx, next) => {
    const {file} = ctx.params;
    console.log(JSON.stringify(file));
    ctx.filePath = path.resolve(__dirname, `../../resources/default_things/${file}`);
    await next()
  });

module.exports = router;