const PATH = require('path');
const Router = require('koa-router');
const frameRouter = new Router();
frameRouter
  .get('/:_id', async (ctx, next) => {
    const {db, params, settings, fs, query, data} = ctx;
    const {_id} = params;
    const messageFile = await db.MessageFileModel.findOnly({_id});
    // const {path} = messageFile;
    let path = "/2019/08/262-frame.jpg";
    let ext = "jpg";
    let filePath = PATH.join(settings.upload.messageVideoFramePath, path);
    try {
      await fs.access(filePath);
    } catch(err) {
      filePath = settings.statics.defaultMessageVideoFramePath;
    }
    ctx.set('Cathe-Control', `public, max-age=${settings.cache.maxAge}`);
    ctx.filePath = filePath;
    ctx.type = ext;
    await next();
  })
module.exports = frameRouter;