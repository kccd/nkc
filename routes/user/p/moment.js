module.exports = async (ctx, next) => {
  const {data, db, nkcModules, query, state} = ctx;
  const {page = 0} = query;
  const {targetUser} = data;
  //获取用户动态列表
  const match = {
    uid: targetUser.uid,
    status: (await db.MomentModel.getMomentStatus()).normal,
    parent: '',
  };
  const count = await db.MomentModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const moments = await db.MomentModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  data.momentsData = await db.MomentModel.extendMomentsListData(moments, state.uid);
  await next();
}
