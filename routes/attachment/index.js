const router = require('koa-router')();
router
  .get('/:id', async (ctx, next) => {
    const {params, db, query} = ctx;
    const {id} = params;
    const a = await db.AttachmentModel.findOnly({_id: id});
    ctx.filePath = await a.getFilePath();
    ctx.type = a.ext;
    await next();
  })
module.exports = router;
