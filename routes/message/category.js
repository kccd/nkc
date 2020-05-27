const router = require('koa-router')();

router
  .get('/', async (ctx, next) => {
    const {query, db, data, nkcModules} = ctx;
    const {cid} = query;
    const {user} = data;
    if(!cid) {

    } else {
      data.category = await db.FriendsCategoryModel.findOne({_id: cid});
    }
    const friends = await db.FriendModel.find({uid: user.uid});
    const friendsObj = {};
    const usersId = friends.map(f => {
      friendsObj[f.tUid] = f;
      return f.tUid;
    });
    const users = await db.UserModel.find({uid: {$in: usersId}});
    data.users = [];
    for(const u of users) {
      const friend = friendsObj[u.uid];
      const {name} = friend.info;
      const _user = {
        username: name || u.username || u.uid,
        uid: u.uid,
        avatar: u.avatar
      };
      data.users.push(_user);
    }
    data.users = nkcModules.pinyin.getGroupsByFirstLetter(data.users, 'username');
    ctx.template = 'message/appCategory/appCategory.pug';
    await next();
  });

module.exports = router;
