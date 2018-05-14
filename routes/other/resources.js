const Router = require('koa-router');
const router = new Router();
const {upload, cache} = require('../../settings');
const {siteSpecificPath} = upload;
const {stat} = require('fs');
const {promisify} = require('util');

router
  .get('/site_specific/', async (ctx, next) => {
    ctx.throw(501, 'a fileName is required.');
    await next()
  })
  .get('/site_specific/:fileName', async (ctx, next) => {
    const {fs} = ctx;
    const {fileName} = ctx.params;
    const url = `${siteSpecificPath}/${fileName}`;
    const stats = await promisify(stat)(url);
    ctx.set('Cache-Control', `public, max-age=${cache.maxAge}`);
    const [name, ext] = fileName.split('.');
    ctx.filePath = url;
    ctx.type = ext;
    await next()
  });

module.exports = router;