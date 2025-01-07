module.exports = async (ctx, next) => {
  /*//获取用户关注的文章
  const {query, nkcModules, state, data, db} = ctx;
  const {page = 0} = query;
  const {match} = state;
  const {targetUser} = data;
  match.uid = targetUser.uid;
  match.type = "thread";
  match.detail = "sub";
  match.cancel = false;
  const count = await db.SubscribeModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const subscribes = await db.SubscribeModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const subscribesObj = {};
  subscribes.map(s => subscribesObj[s.tid] = s);
  //获取关注的文章id
  data.subThreadsId = await db.SubscribeModel.getUserSubThreadsId(targetUser.uid, "sub");
  data.subscribesObj = subscribesObj;
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  data.paging = paging;*/
  await next();
};
