const Router = require('koa-router');
const router = new Router();
const { subscribeSources } = require('../../settings/subscribe');
const {
  subscribeColumnService,
} = require('../../services/subscribe/subscribeColumn.service');

router.post('/', async (ctx, next) => {
  const { db, body, data } = ctx;
  let { type, cid = [] } = body;
  const { column, user } = data;
  if (type === 'subscribe') {
    await user.ensureSubLimit(subscribeSources.column);
    await subscribeColumnService.checkSubscribeColumn(user.uid, column._id);
    for (const typeId of cid) {
      const subType = await db.SubscribeTypeModel.findOne({
        _id: typeId,
        uid: user.uid,
      });
      if (!subType) {
        ctx.throw(400, `未找到ID为${typeId}的关注分类`);
      }
    }
    await subscribeColumnService.subscribeColumn(user.uid, column._id, cid);
  } else {
    await subscribeColumnService.unsubscribeColumn(user.uid, column._id);
    cid = await subscribeColumnService.getSubscribeColumnCategoriesId(
      user.uid,
      column._id,
    );
  }
  await db.SubscribeModel.saveUserSubColumnsId(user.uid);
  data.subCount = await subscribeColumnService.getSubscribeColumnCount(
    column._id,
  );
  console.log(data.subCount)
  await column.updateOne({ subCount: data.subCount });
  await db.SubscribeTypeModel.updateCount(cid);
  await next();
});
module.exports = router;
