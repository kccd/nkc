const router = require('koa-router')();
router
  .get('/:id', async (ctx, next) => {
    const {params, db, query} = ctx;
    const {id} = params;
    const {t} = query;
    if(t && !['sm', 'lg'].includes(t)) ctx.throw(400, '位置的文件尺寸');
    const a = await db.AttachmentModel.findOnly({_id: id});
    ctx.filePath = await a.getFilePath(t);
    ctx.type = a.ext;
    await next();
  })
module.exports = router;
