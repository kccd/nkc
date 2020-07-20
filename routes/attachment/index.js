const router = require('koa-router')();
const fsPromise = require('fs').promises;
router
  .get('/:id', async (ctx, next) => {
    const {params, db, query, settings, data} = ctx;
    const {user} = data;
    const {statics} = settings;
    const {id} = params;
    const {t, c} = query;
    if(t && !['sm', 'lg'].includes(t)) ctx.throw(400, '位置的文件尺寸');
    const a = await db.AttachmentModel.findOne({_id: id, type: c});
    if(a) {
      ctx.filePath = await a.getFilePath(t);
      ctx.type = a.ext;
    }
    let notFoundFile = false;
    if(!a) {
      notFoundFile = true;
    } else {
      try{
        await fsPromise.access(ctx.filePath);
      } catch(err) {
        notFoundFile = true;
      }
    }
    if(notFoundFile) {
      switch(c) {
        case 'userAvatar':
          ctx.filePath = statics.defaultAvatarPath; break;
        case 'userBanner':
          ctx.filePath = statics.defaultUserBannerPath; break;
        case 'scoreIcon':
          ctx.filePath = statics.defaultScoreIconPath; break;
        default: ctx.filePath = statics.defaultAvatarPath;
        // default: ctx.throw(400, '数据未找到');
      }
    }
    await next();
  })
module.exports = router;
