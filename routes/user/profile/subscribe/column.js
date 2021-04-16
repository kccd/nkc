module.exports = async (ctx, next) => {
  const {nkcModules, db, data, state, query} = ctx;
  const {match} = state;
  const {page = 0} = query;
  const {targetUser} = data;
  match.uid = targetUser.uid;
  match.type = "column";
  const count = await db.SubscribeModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const subscribes = await db.SubscribeModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const subscribesObj = {};
  subscribes.map(s => subscribesObj[s.columnId] = s);
  data.subscribesObj = subscribesObj;
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  data.paging = paging;
  await next();
};