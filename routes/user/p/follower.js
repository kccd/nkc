module.exports = async (ctx, next) => {
  const {data, db, state, params, query, nkcModules} = ctx;
  const {user, targetUser} = data;
  const {pageSettings} = state;
  const {t='', page=0} = query;
  //关注或粉丝
  // if(Number(page) >= 1) {
  //   if(!ctx.permission("viewUserAllFansAndFollowers")) {
  //     if(!user) {
  //       data.noPromission = true;
  //     } else {
  //       if(user.uid !== targetUser.uid) {
  //         const isFriend = await db.FriendModel.findOne({uid: user.uid, tUid: targetUser.uid});
  //         if(!isFriend) data.noPromission = true;
  //       }
  //     }
  //   }
  // }
  let paging;
  if(user) {
    data.userSubUid = await db.SubscribeModel.getUserSubUsersId(user.uid);
  }
  const q = {
    type: "user",
    cancel: false,
  };
  const m = {};
  if(t === "follower") {
    //关注的用户
    q.uid = targetUser.uid;
    m.tUid = 1;
  } else {
    //粉丝
    q.tUid = targetUser.uid;
    m.uid = 1;
  }
  const count = await db.SubscribeModel.countDocuments(q);
  paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardUserList);
  const subs = await db.SubscribeModel.find(q, m).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  data.users = await db.UserModel.find({uid: {$in: subs.map(s => t === 'follower'? s.tUid : s.uid)}});
  data.users = await db.UserModel.extendUsersInfo(data.users);
  //排除封禁用户和名片被屏蔽的用户
  if(data.users && data.users.length) {
    data.users = data.users.filter(u => {
      u.description = nkcModules.nkcRender.replaceLink(u.description);
      return !u.certs.includes('banned') && !u.hidden;
    })
  }
  data.paging = paging;
  await next();
}
