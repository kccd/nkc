const router = require('koa-router')();

router
  .get('/', async (ctx, next) => {
    const {query, db, data, nkcModules} = ctx;
    const {cid} = query;
    const {user} = data;

    let category;

    if(cid) {
      // 查看、编辑分组
      data.category = await db.FriendsCategoryModel.findOne({_id: cid, uid: user.uid}, {
        _id: 1,
        name: 1,
        description: 1,
        friendsId: 1,
      });
    } else {
      // 新建分组
    }

    const friends = await db.FriendModel.find({uid: user.uid}, {tUid: 1, cid: 1});
    const allUsersId = friends.map(f => {
      return f.tUid;
    });
    const allUsers = await db.UserModel.find({uid: {$in: allUsersId}}, {
      username: 1,
      uid: 1,
      avatar: 1
    });
    allUsers.map(u => {
      u.avatar = nkcModules.tools.getUrl('userAvatar', u.avatar);
    });
    data.users = nkcModules.pinyin.getGroupsByFirstLetter(allUsers, 'username');
    ctx.template = 'message/appCategory/appCategory.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body, data, nkcModules} = ctx;
    const {type, name, description, friendsId, _id} = body;
    const {checkString} = nkcModules.checkData;
    const {user} = data;
    checkString(name, {
      name: '分组名称',
      minLength: 0,
      maxLength: 20,
    });
    checkString(description, {
      name: '分组简介',
      minLength: 0,
      maxLength: 500
    });
    const friendsUid = await db.FriendModel.getFriendsUid(user.uid);
    const newUsersId = friendsId.filter(id => friendsUid.includes(id));
    let category;
    if(type === 'modifyCategory') {
      category = await db.FriendsCategoryModel.findOnly({_id, uid: user.uid});
      await category.updateOne({
        $set: {
          name,
          description,
          friendsId: newUsersId
        }
      });
    } else if(type === 'createCategory') {
      category = db.FriendsCategoryModel({
        _id: await db.SettingModel.operateSystemID('friendsCategories', 1),
        uid: user.uid,
        name,
        description,
        friendsId: newUsersId
      });
      await category.save();
    }
    data.categoryId = category._id;
    await nkcModules.socket.sendEventUpdateCategoryList(user.uid);
    await next();
  })
  .del('/', async (ctx, next) => {
    const {nkcModules, query, db, data} = ctx;
    const {user} = data;
    const {cid} = query;
    const category = await db.FriendsCategoryModel.findOne({uid: user.uid, _id: cid});
    if(category) {
      await category.remove();
      await nkcModules.socket.sendEventRemoveCategory(user.uid, category._id);
    }
    await next();
  });

module.exports = router;
