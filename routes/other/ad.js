const Router = require('koa-router');
const adRouter = new Router();
const {upload, statics} = require('../../settings');
const {defaultAdPath} = statics;
const {adPath} = upload;
adRouter
  .get('/:tid', async (ctx, next) => {
    const {fs} = ctx;
    const {tid} = ctx.params;
    let url = `${adPath}/${tid}.jpg`;
    try{
      await fs.access(url);
    } catch(e) {
      url = defaultAdPath;
    }
    ctx.filePath = url;
    await next()
  });
module.exports = adRouter;