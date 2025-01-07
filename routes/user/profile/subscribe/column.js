const { subscribeSources } = require('../../../../settings/subscribe');
module.exports = async (ctx, next) => {
  //获取用户关注的专栏
  const { nkcModules, db, data, state, query } = ctx;
  const { match } = state;
  const { page = 0 } = query;
  const { targetUser, user } = data;
  if (user.uid !== targetUser.uid) {
    ctx.throw(401, '权限不足');
  }
  match.uid = targetUser.uid;
  match.source = subscribeSources.column;
  match.cancel = false;
  //获取关注的专栏id
  const subColumnsId = await db.SubscribeModel.getUserSubColumnsId(user.uid);
  const count = await db.SubscribeModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const subscribes = await db.SubscribeModel.find(match)
    .sort({ toc: -1 })
    .skip(paging.start)
    .limit(paging.perpage);
  const subscribesObj = {};
  subscribes.map((s) => (subscribesObj[s.sid] = s));
  data.subscribesObj = subscribesObj;
  data.subColumnsId = subColumnsId;
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  data.paging = paging;
  await next();
};
