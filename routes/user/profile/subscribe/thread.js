module.exports = async (ctx, next) => {
  const {query, nkcModules, state, data, db} = ctx;
  const {page = 0} = query;
  const {match} = state;
  const {targetUser} = data;
  match.uid = targetUser.uid;
  match.type = "thread";
  match.detail = "sub";
  const count = await db.SubscribeModel.count(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const subscribes = await db.SubscribeModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const subscribesObj = {};
  subscribes.map(s => subscribesObj[s.tid] = s);
  data.subscribesObj = subscribesObj;
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  await next();
};