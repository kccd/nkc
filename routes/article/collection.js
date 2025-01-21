const router = require('koa-router')();
const { OnlyUnbannedUser } = require('../../middlewares/permission');
const {
  collectionService,
} = require('../../services/subscribe/collection.service');
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  //收藏独立文章
  const { db, data, params, body } = ctx;
  const { aid } = params;
  const { type, cid = [] } = body;
  const { user } = data;
  const article = await db.ArticleModel.findOnly({ _id: aid });
  if (!article) {
    ctx.throw(404, '未找到文章，请刷新后重试');
  }
  const { disabled } = await db.ArticleModel.getArticleStatus();
  if (article.status === disabled) {
    ctx.throw(400, '不能收藏已被封禁的文章');
  }
  if (type) {
    await collectionService.checkWhenCollectArticle(user.uid, aid);
    for (const typeId of cid) {
      const subType = await db.SubscribeTypeModel.findOne({
        _id: typeId,
        uid: user.uid,
      });
      if (!subType) {
        ctx.throw(400, `未找到ID为${typeId}的关注分类`);
      }
    }
    await collectionService.collectArticle(user.uid, aid, cid);
    await db.SubscribeTypeModel.updateCount(cid);
  } else {
    await collectionService.unCollectArticle(user.uid, aid);
    const cid = await collectionService.getCollectedArticleCategoriesId(
      user.uid,
      aid,
    );
    await db.SubscribeTypeModel.updateCount(cid);
  }
  await db.SubscribeModel.saveUserCollectionThreadsId(user.uid);
  data.targetUser = (await db.ArticleModel.getArticlesInfo([article]))[0].user;
  await next();
});
module.exports = router;
