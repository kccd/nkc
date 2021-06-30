const PATH = require('path');
const FILE = require('../../nkcModules/file');
const Router = require('koa-router');
const resourceRouter = new Router();
resourceRouter
  .get('/:_id', async (ctx, next) => {
    const {db, params, settings, fs, query, data} = ctx;
    const {_id} = params;
    const {user} = data;
    const {type, channel} = query;
    const messageFile = await db.MessageFileModel.findOnly({_id});
    if(messageFile.targetUid !== user.uid && messageFile.uid !== user.uid && !ctx.permission("getAllMessagesResources")) ctx.throw(403, '权限不足');
    let {ext} = messageFile;
    let filePath = await messageFile.getFilePath(type);
    const fileType = await db.MessageFileModel.getFileTypeByExtension(ext);
    if(fileType === 'image') {
      try {
        await fs.access(filePath);
      } catch(err) {
        filePath = settings.statics.defaultMessageFilePath;
      }
      ctx.set('Cathe-Control', `public, max-age=${settings.cache.maxAge}`);
    }
    await messageFile.updateOne({$inc: {hits: 1}});
    ctx.filePath = filePath;
    ctx.resource = messageFile;
    ctx.type = ext;
    await next();
  });
module.exports = resourceRouter;
