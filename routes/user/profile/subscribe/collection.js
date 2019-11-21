module.exports = async (ctx, next) => {
  const {data, db, state, nkcModules, query} = ctx;
  const {page = 0} = query;
  const {targetUser} = data;
  const {match} = state;
  match.uid = targetUser.uid;
  match.type = "collection";
  const count = await db.SubscribeModel.count(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const subscribes = await db.SubscribeModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const subscribesObj = {};
  subscribes.map(s => subscribesObj[s.tid] = s);
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  data.subscribesObj = subscribesObj;
  data.paging = paging;
  await next();
};