module.exports = async (ctx, next) => {
  const {db, nkcModules, data, query} = ctx;
  const {fansId} = data;
  const {page = 0} = query;
  const paging = nkcModules.apiFunction.paging(page, fansId.length);
  const usersId = fansId.slice(paging.start, paging.start + paging.perpage);
  let users = await db.UserModel.find({uid: {$in: usersId}});
  users = await db.UserModel.extendUsersInfo(users);
  const usersObj = {};
  const subscribes = await db.SubscribeModel.find({
    type: "user",
    uid: {$in: usersId},
    tUid: data.targetUser.uid
  });
  const subscribesObj = {};
  subscribes.map(s => subscribesObj[s.uid] = s);
  users.map(user => usersObj[user.uid] = user);
  data.users = [];
  for(const uid of usersId) {
    const u = usersObj[uid];
    const subscribe = subscribesObj[uid];
    if(u && subscribe) data.users.push(u);
  }
  data.subscribes = subscribesObj;
  data.paging = paging;
  await next();
};