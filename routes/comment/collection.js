const Router = require('koa-router');
const {
  collectionService,
} = require('../../services/subscribe/collection.service');
const { OnlyUnbannedUser } = require('../../middlewares/permission');
const router = new Router();
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { body, params, db, data } = ctx;
  const { _id } = params;
  const { type, cid = [] } = body;
  const { user } = data;
  const comment = await db.CommentModel.findOnly({ _id });
  // if (comment.status !== 'normal') {
  //   ctx.throw(403, '不能收藏状态异常的评论');
  // }
  // 是否需要在收藏评论时对来源的文章的权限进行判断？？？

  if (type) {
    if (comment.status !== 'normal') {
      ctx.throw(403, '不能收藏状态异常的评论');
    }
    await collectionService.checkWhenCollectComment(user.uid, _id);
    for (const typeId of cid) {
      const subType = await db.SubscribeTypeModel.findOne({
        _id: typeId,
        uid: user.uid,
      });
      if (!subType) {
        ctx.throw(400, `未找到ID为${typeId}的收藏分类`);
      }
    }
    await collectionService.collectComment(user.uid, _id, cid);
    await db.SubscribeTypeModel.updateCount(cid);
  } else {
    await collectionService.unCollectComment(user.uid, _id);
    const cid = await collectionService.getCollectedCommentCategoriesId(
      user.uid,
      _id,
    );
    await db.SubscribeTypeModel.updateCount(cid);
  }
  // 是否需要更新缓存
  await db.SubscribeModel.saveUserCollectionThreadsId(user.uid);
  // data.targetUser = await post.extendUser();
  await next();
});
module.exports = router;
