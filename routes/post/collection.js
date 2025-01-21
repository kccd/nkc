const Router = require('koa-router');
const router = new Router();
const {
  collectionService,
} = require('../../services/subscribe/collection.service');
const { OnlyUnbannedUser } = require('../../middlewares/permission');
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { body, params, db, data } = ctx;
  const { pid } = params;
  const { type, cid = [] } = body;
  const { user } = data;
  const post = await db.PostModel.findOnly({ pid });
  // if (post.disabled) {
  //   ctx.throw(403, '不能收藏已被封禁的回复');
  // }
  // await thread.extendForums(['mainForums', 'minorForums']);
  // await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
  // 是否需要在收藏回复的是否对回复来源的文章的权限进行判断

  if (type) {
    if (post.disabled) {
      ctx.throw(403, '不能收藏已被封禁的回复');
    }
    await collectionService.checkWhenCollectPost(user.uid, pid);
    for (const typeId of cid) {
      const subType = await db.SubscribeTypeModel.findOne({
        _id: typeId,
        uid: user.uid,
      });
      if (!subType) {
        ctx.throw(400, `未找到ID为${typeId}的收藏分类`);
      }
    }
    await collectionService.collectPost(user.uid, pid, cid);
    await db.SubscribeTypeModel.updateCount(cid);
  } else {
    await collectionService.unCollectPost(user.uid, pid);
    const cid = await collectionService.getCollectedPostCategoriesId(
      user.uid,
      pid,
    );
    await db.SubscribeTypeModel.updateCount(cid);
  }
  // 是否需要更新缓存
  await db.SubscribeModel.saveUserCollectionThreadsId(user.uid);
  data.targetUser = await post.extendUser();
  await next();
});
module.exports = router;
