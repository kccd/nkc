const Router = require('koa-router');
const resourceRouter = new Router();
resourceRouter
  .get('/:_id', async (ctx, next) => {
    const {db, params, query, data} = ctx;
    const {_id} = params;
    const {user} = data;
    const {t} = query;
    const messageFile = await db.MessageFileModel.findOnly({_id});
    if(messageFile.targetUid !== user.uid && messageFile.uid !== user.uid && !ctx.permission("getAllMessagesResources")) ctx.throw(403, '权限不足');
    ctx.remoteFile = await messageFile.getRemoteFile(t);
    await messageFile.updateOne({$inc: {hits: 1}});
    ctx.resource = messageFile;
    ctx.type = messageFile.ext;
    await next();
  });
module.exports = resourceRouter;
