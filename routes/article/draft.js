const {
  OnlyOperation,
  OnlyUnbannedUser,
} = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');

const router = require('koa-router')();
router.del('/', OnlyUnbannedUser(), async (ctx, next) => {
  //删除文章草稿
  const { db, params, state } = ctx;
  const { aid } = params;
  const article = await db.ArticleModel.getArticleByIdAndUid(aid, state.uid);
  await article.deleteDraft();
  await next();
});
module.exports = router;
