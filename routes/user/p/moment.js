module.exports = async (ctx, next) => {
  const {data, db, nkcModules, query, state, permission} = ctx;
  const {page = 0, t = 'moment'} = query;
  const {targetUser, user} = data;
  data.t = t;
  const {
    normal: normalStatus,
    faulty: faultyStatus,
    unknown: unknownStatus,
  } = await db.MomentModel.getMomentStatus();
  const {moment: momentType} = await db.MomentModel.getMomentQuoteTypes();
  //获取用户动态列表
  const match = {
    uid: targetUser.uid,
    parent: '',
    $or: [
      {
        status: normalStatus
      },
      {
        uid: state.uid,
        status: {
          $in: [
            normalStatus,
            faultyStatus,
            unknownStatus,
          ]
        }
      }
    ]
  };
  if(t === 'moment') {
    match.quoteType = momentType;
  } else if(t === 'thread') {
    match.quoteType = {
      $ne: true,
    }
  }
  //获取当前用户对动态的审核权限
  const permissions = {
    reviewed: null,
  };
  if(user) {
    if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
      permissions.reviewed = true;
    }
  }
  const count = await db.MomentModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count, 20);
  const moments = await db.MomentModel.find(match).sort({top: -1}).skip(paging.start).limit(paging.perpage);
  data.paging = paging;
  data.permissions = permissions;
  data.momentsData = await db.MomentModel.extendMomentsListData(moments, state.uid);
  await next();
}
