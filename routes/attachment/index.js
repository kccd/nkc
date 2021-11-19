const router = require('koa-router')();
router
  .get('/:id', async (ctx, next) => {
    const {params, db, query, settings} = ctx;
    const {id} = params;
    const {t} = query;
    if(t && !['sm', 'lg', 'md', 'ico'].includes(t)) ctx.throw(400, '未知的文件尺寸');
    const attachment = await db.AttachmentModel.findOne({_id: id});
    if(attachment) {
      ctx.remoteFile = await attachment.getRemoteFile(t);
    } else {
      ctx.filePath = settings.statics.defaultAvatarPath;
    }
    await next();
  })
module.exports = router;
