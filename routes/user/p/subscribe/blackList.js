module.exports = async (ctx, next) => {
  const {data, db, query, nkcModules} = ctx;
  const {user} = data;
  const {page = 0} = query;
  const match = {
    uid: user.uid
  };
  const count = await db.BlacklistModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count);
  const bl = await db.BlacklistModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  const usersId = bl.map(b => {
    return b.tUid
  });
  const users = await db.UserModel.find({uid: usersId});
  const usersObj = {};
  for(const u of users) {
    usersObj[u.uid] = u
  }
  await db.UserModel.extendUsersInfo(users);
  data.bl = [];
  for(const b of bl) {
    const {tUid, _id, toc, from, pid} = b;
    const targetUser = usersObj[tUid];
    if(!targetUser) return;
    let fromHTML = "";
    if(from === 'message') {
      fromHTML = '短消息系统';
    } else if(from === 'userCard') {
      fromHTML = '用户名片';
    } else {
      fromHTML = `<a href="${nkcModules.tools.getUrl('post', pid, true)}" target='_blank'>文号${pid}</a>`;
    }
    data.bl.push({
      _id,
      from,
      fromHTML,
      pid,
      toc,
      user: targetUser
    })
  }
  data.paging = paging;
  await next();
};
