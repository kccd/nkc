const router = require('koa-router')();
router
  .get('/:id', async (ctx, next) => {
    const {params, db, query, settings} = ctx;
    const {statics} = settings;
    const {id} = params;
    const {t, c} = query;
    if(t && !['sm', 'lg'].includes(t)) ctx.throw(400, '位置的文件尺寸');
    const a = await db.AttachmentModel.findOne({_id: id});
    if(!a) {
      switch(c) {
        case 'userAvatar':
          ctx.filePath = statics.defaultAvatarPath; break;
        case 'userBanner':
          ctx.filePath = statics.defaultUserBannerPath; break;
        default: ctx.throw(400, '数据未找到');
      }
    } else {
      ctx.filePath = await a.getFilePath(t);
      ctx.type = a.ext;
    }
    await next();
  })
module.exports = router;
