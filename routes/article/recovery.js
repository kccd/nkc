const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');

const router = require('koa-router')();
router.post(
  '/',
  // 目前使用的是解封文章的操作名后期可以新建一个恢复文章的操作名
  OnlyOperation(Operations.unblockArticle),
  async (ctx, next) => {
    const { db, params } = ctx;
    const { aid } = params;
    const article = await db.ArticleModel.findOnly({ _id: aid });
    const { stable } = await db.DocumentModel.getDocumentTypes();
    const document = await db.DocumentModel.findOnly({
      did: article.did,
      type: stable,
    });
    if (!article || !document) {
      ctx.throw(404, '未找到文章，请刷新后重试');
    }

    const { disabled, normal, deleted } =
      await db.DocumentModel.getDocumentStatus();
    if (document.status !== disabled && document.status !== deleted) {
      ctx.throw(400, '文章未被禁用或删除，请刷新后重试');
    }

    await document.setStatus(normal);
    await next();
  },
);
module.exports = router;
