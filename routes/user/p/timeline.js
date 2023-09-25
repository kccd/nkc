const {
  subscribeUserService,
} = require('../../../services/subscribe/subscribeUser.service');
module.exports = async (ctx, next) => {
  const { data, db, nkcModules, query, state, permission } = ctx;
  const { page = 0 } = query;
  const { targetUser, user } = data;
  const {
    normal: normalMoment,
    faulty: faultyMoment,
    unknown: unknownMoment,
    disabled: disabledMoment,
  } = await db.MomentModel.getMomentStatus();
  const { own, everyone, attention } =
    await db.MomentModel.getMomentVisibleType();
  const isAuthor = targetUser.uid === state.uid;
  // const {moment: momentType, article: articleType} = await db.MomentModel.getMomentQuoteTypes();
  //获取用户动态列表
  let match = {
    uid: targetUser.uid,
    parent: '',
    $or: [
      {
        status: normalMoment,
      },
      {
        uid: state.uid,
        status: {
          $in: [normalMoment, faultyMoment, unknownMoment, disabledMoment],
        },
      },
    ],
    visibleType: {
      $in: [everyone],
    },
  };
  const isSubscribedUser = await subscribeUserService.isSubscribedUser(
    state.uid,
    targetUser.uid,
  );
  if (
    isAuthor ||
    ctx.permission('setMomentVisibleOther') ||
    ctx.permission('viewAllUserMoment')
  ) {
    match.visibleType.$in = [own, everyone, attention];
  } else if (isSubscribedUser) {
    match.visibleType.$in = [attention, everyone];
  }
  const count = await db.MomentModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count, 20);
  const moments = await db.MomentModel.find(match)
    .sort({ top: -1 })
    .skip(paging.start)
    .limit(paging.perpage);
  data.momentsData = await db.MomentModel.extendMomentsListData(
    moments,
    state.uid,
  );

  //获取当前用户对动态的审核权限
  const permissions = {
    reviewed: null,
  };

  if (user) {
    if (permission('movePostsToRecycle') || permission('movePostsToDraft')) {
      permissions.reviewed = true;
    }
  }

  data.paging = paging;
  data.permissions = permissions;
  await next();
};
