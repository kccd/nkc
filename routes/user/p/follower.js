module.exports = async (ctx, next) => {
  const {data, db, state, params, query, nkcModules} = ctx;
  const {user, targetUser} = data;
  const {pageSettings} = state;
  const {t='', page=0} = query;
  //关注或粉丝
  if(Number(page) >= 1) {
    if(!ctx.permission("viewUserAllFansAndFollowers")) {
      if(!user) {
        data.noPromission = true;
      } else {
        if(user.uid !== targetUser.uid) {
          const isFriend = await db.FriendModel.findOne({uid: user.uid, tUid: targetUser.uid});
          if(!isFriend) data.noPromission = true;
        }
      }
    }
  }
  let paging;
  if(t === "follower") {
    //关注的用户
    const q = {
      uid: targetUser.uid,
      type: "user",
      cancel: false,
    };
    const count = await db.SubscribeModel.countDocuments(q);
    paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardUserList);
    if(!data.noPromission) {
      const subs = await db.SubscribeModel.find(q, {tUid: 1}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      data.users = await db.UserModel.find({uid: {$in: subs.map(s => s.tUid)}});
      data.users = await db.UserModel.extendUsersInfo(data.users)
    }
  } else {
    //粉丝
    const q = {
      tUid: targetUser.uid,
      type: "user",
      cancel: false,
    };
    const count = await db.SubscribeModel.countDocuments(q);
    paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardUserList);
    if(!data.noPromission) {
      const subs = await db.SubscribeModel.find(q, {uid: 1}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      data.users = await db.UserModel.find({uid: {$in: subs.map(s => s.uid)}});
      data.users = await db.UserModel.extendUsersInfo(data.users);
    }
  }
  //排除封禁用户和名片被屏蔽的用户
  if(data.user && data.users.length) {
    data.users = data.users.filter(u => {
      u.description = nkcModules.nkcRender.replaceLink(u.description);
      return !u.certs.includes('banned') && !u.hidden;
    })
  }
  await next();
}
