const router = require('koa-router')();
const fsPromise = require('fs').promises;
router
  .get('/:id', async (ctx, next) => {
    const {params, db, query, settings, data, nkcModules} = ctx;
    const {user} = data;
    const {statics} = settings;
    const {id} = params;
    const {t, c} = query;
    if(t && !['sm', 'lg', 'md'].includes(t)) ctx.throw(400, '未知的文件尺寸');
    const a = await db.AttachmentModel.findOne({_id: id});
    if(a) {
      ctx.filePath = await a.getFilePath(t);
      ctx.type = a.ext;
    }
    let notFoundFile;
    if(!a || !ctx.filePath) {
      notFoundFile = true;
    } else {
      notFoundFile = !await nkcModules.file.access(ctx.filePath);
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
