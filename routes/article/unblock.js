const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
      const {db, data, state, params} = ctx;
      const {aid} = params;
      const article = await db.ArticleModel.findOnly({_id: aid});
      const {stable} = await db.DocumentModel.getDocumentTypes();
      const {disabled, normal} = await db.DocumentModel.getDocumentStatus();
      const document = await db.DocumentModel.findOnly({did: article.did, type: stable});
      if(document.status !== disabled) ctx.throw(400, '文章未被禁用，请刷新后重试');
      await document.setStatus(normal);
      if(!article || !document) ctx.throw(404, '未找到文章，请刷新后重试');
      await next();
  })
module.exports = router;
