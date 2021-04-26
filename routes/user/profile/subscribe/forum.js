module.exports = async (ctx, next) => {
  const {db, query, data, state, nkcModules} = ctx;
  let {page = 0, t} = query;
  const {match, forumCategories} = state;
  const fcId = forumCategories.map(f => f._id);
  const {targetUser} = data;
  match.uid = targetUser.uid;
  match.type = "forum";
  match.cancel = false;
  if(t !== undefined) {
    t = Number(t);
    if(!fcId.includes(t)) ctx.throw(400, `未知的专业分类 id: ${t}`);
    const _forums = await db.ForumModel.find({categoryId: t}, {fid: 1});
    const _forumsId = _forums.map(f => f.fid);
    match.fid = {$in: _forumsId};
    data.t = t;
  }
  const count = await db.SubscribeModel.countDocuments(match);
  const paging = await nkcModules.apiFunction.paging(page, count);
  const subscribes = await db.SubscribeModel.find(match);
  const subscribesObj = {};
  subscribes.map(s => subscribesObj[s.fid] = s);
  data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
  data.subscribesObj = subscribesObj;
  data.paging = paging;
  await next();
};
