const Router = require('koa-router');
const router = new Router();
const {upload} = require('../../settings');
const {defaultPath} = upload;
router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a filename is required.');
    await next()
  })
  .get('/:file', async (ctx, next) => {
    const {file} = ctx.params;
    ctx.filePath = `${defaultPath}/${file}`;
    await next()
  });

module.exports = router;