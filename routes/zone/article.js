const router = require('koa-router')();
const { Public, OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router
  .get('/:aid', Public(), async (ctx) => {
    const { params, query } = ctx;
    const { aid } = params;
    const { page = 0, highlight } = query;
    if (highlight) {
      return ctx.redirect(
        `/article/${aid}?page=${page}&highlight=${highlight}`,
      );
    } else {
      return ctx.redirect(`/article/${aid}?page=${page}`);
    }
  })
  .put(
    '/:aid/category',
    OnlyOperation(Operations.manageZoneArticleCategory),
    async (ctx, next) => {
      const { db, params, body } = ctx;
      const { tcId } = body;
      const { aid } = params;
      if (tcId) {
        await db.ArticleModel.updateOne({ _id: aid }, { $set: { tcId } });
      }
      await next();
    },
  );
module.exports = router;
