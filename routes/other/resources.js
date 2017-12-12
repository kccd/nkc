const Router = require('koa-router');
const router = new Router();
const {upload} = require('../../settings');
const {siteSpecificPath} = upload;

router
  .get('/site_specific/', async (ctx, next) => {
    ctx.throw(501, 'a fileName is required.');
    await next()
  })
  .get('/site_specific/:fileName', async (ctx, next) => {
    const {fs} = ctx;
    const {fileName} = ctx.params;
    const url = `${siteSpecificPath}/${fileName}`;
    await fs.access(url);
    ctx.filePath = url;
    await next()
  })
  .get('/site_specific/forum_icon/:fileName', async (ctx, next) => {
    const {fs} = ctx;
    const {fileName} = ctx.params;
    const url = `${siteSpecificPath}/forum_icon/${fileName}`;
    await fs.access(url);
    ctx.filePath = url;
    await next();
  });

module.exports = router;