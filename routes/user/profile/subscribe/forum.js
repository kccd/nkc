const { subscribeSources } = require('../../../../settings/subscribe');
module.exports = async (ctx, next) => {
  const { db, query, data, state, nkcModules } = ctx;
  let { page = 0, t } = query;
  const { user, targetUser } = data;
  const { match } = state;
  if (user.uid !== targetUser.uid) {
    ctx.throw(401, '权限不足');
  }
  const forumCategories = await db.ForumCategoryModel.getCategories();
  const fcId = forumCategories.map((f) => f._id);
  data.forumCategories = forumCategories;
  match.source = subscribeSources.forum;
  match.uid = targetUser.uid;
  match.cancel = false;
  if (t !== undefined) {
    t = Number(t);
    if (!fcId.includes(t)) {
      ctx.throw(400, `未知的专业分类 id: ${t}`);
    }
    const _forums = await db.ForumModel.find({ categoryId: t }, { fid: 1 });
    const _forumsId = _forums.map((f) => f.fid);
    match.sid = { $in: _forumsId };
    data.t = t;
  }
  const subTopicsId = await db.SubscribeModel.getUserSubForumsId(
    targetUser.uid,
    'topic',
  );
  const subDisciplinesId = await db.SubscribeModel.getUserSubForumsId(
    targetUser.uid,
    'discipline',
  );
  data.subForumsId = subTopicsId.concat(subDisciplinesId);
  const count = await db.SubscribeModel.countDocuments(match);
  const paging = await nkcModules.apiFunction.paging(page, count);
  const subscribes = await db.SubscribeModel.find(match);
  const subscribesObj = {};
  subscribes.map((s) => (subscribesObj[s.sid] = s));
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  data.subscribesObj = subscribesObj;
  data.paging = paging;
  await next();
};
