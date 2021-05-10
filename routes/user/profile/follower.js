module.exports = async (ctx, next) => {
  const {db, nkcModules, data, query} = ctx;
  const {subUsersId} = data;
  const {page = 0} = query;
  const {targetUser} = data;
  const match = {
    type: "user",
    tUid: targetUser.uid,
    cancel: false,
  };
  const count = await db.SubscribeModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const subscribes = await db.SubscribeModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  const fansId = subscribes.map(s => s.uid);
  const subscribeUsers = await db.SubscribeModel.find({
    type: "user",
    cancel: false,
    uid: targetUser.uid,
    tUid: {$in: fansId}
  });
  const subscribesObj = {};
  subscribeUsers.map(s => subscribesObj[s.tUid] = s);
  data.subscribesObj = subscribesObj;
  data.paging = paging;
  await next();
};