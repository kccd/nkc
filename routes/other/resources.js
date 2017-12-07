const Router = require('koa-router');
const router = new Router();
const {accessSync} = require('fs');
const path = require('path');

router
  .get('/site_specific/', async (ctx, next) => {
    ctx.throw(501, 'a fileName is required.');
    await next()
  })
  .get('/site_specific/:fileName', async (ctx, next) => {
    const {fileName} = ctx.params;
    try {
      const url = path.resolve(__dirname, `../../resources/site_specific/${fileName}`);
      accessSync(url);
      ctx.filePath = url;
    } catch(e) {
      ctx.filePath = path.resolve(__dirname, '../../resources/default_things/default_site_specific.gif');
    }
    await next()
  })
  .get('/site_specific/forum_icon/:fileName', async (ctx, next) => {
    const {fileName} = ctx.params;
    try {
      const url = path.resolve(__dirname, `../../resources/site_specific/forum_icon/${fileName}`);
      accessSync(url);
      ctx.filePath = url;
    } catch (e) {
      ctx.filePath = path.resolve(__dirname, '../../resources/default_things/default_forum_icon.gif');
    }
    await next();
  });

module.exports = router;