module.exports = async (ctx, next) => {
  //获取用户收藏的文章
  const {data, db, state, nkcModules, query} = ctx;
  const {page = 0} = query;
  const {targetUser, user} = data;
  if(user.uid !== targetUser.uid) ctx.throw(401, '权限不足');
  const {match} = state;
  match.uid = targetUser.uid;
  match.type = {
    $in: ['collection', 'article']
  };
  match.cancel = false;
  const count = await db.SubscribeModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  //获取收藏的内容
  const subscribes = await db.SubscribeModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const subscribesObj = {};
  subscribes.map(s => subscribesObj[s.tid] = s);
  //获取收藏的文章id
  data.collectionThreadsId = await db.SubscribeModel.getUserCollectionThreadsId(targetUser.uid);
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  data.subscribesObj = subscribesObj;
  data.paging = paging;
  await next();
};
