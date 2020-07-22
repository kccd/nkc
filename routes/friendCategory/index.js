const Router = require('koa-router');
const router = new Router();

router
  .post('/', async (ctx, next) => {
    const {body, data, db, redis} = ctx;
    const {user} = data;
    const {name, description, friendsId} = body;
    if(!name) ctx.throw(400, '分组名不能为空');
    if(name.length > 20) ctx.throw(400, '分组名不能超过20个字');
    const sameNameCategory = await db.FriendsCategoryModel.findOne({uid: user.uid, name});
    if(sameNameCategory) ctx.throw(400, '分组名已存在');
    if(!description) ctx.throw(400, '分组介绍不能为空');
    if(description.length > 250) ctx.throw(400, '分组介绍不能超过20个字');
    const friendsUid = [];
    const _id = await db.SettingModel.operateSystemID('friendsCategories', 1);
    for(const uid of friendsId) {
      const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
      if(!friend) continue;
      friendsUid.push(uid);
    }

    await db.FriendModel.updateMany({uid: user.uid, tUid: {$in: friendsUid}}, {$addToSet: {cid: _id}});

    const category = db.FriendsCategoryModel({
      _id,
      friendsId: friendsUid,
      name,
      description,
      uid: user.uid
    });
    await category.save();
    data.category = category;
    await redis.pubMessage({
      ty: 'editFriendCategory',
      editType: 'add',
      category: category
    });
    await next();
  })
  .put('/:_id', async (ctx, next) => {
    const {body, data, db, params,redis} = ctx;
    const {_id} = params;
    const {user} = data;
    const category = await db.FriendsCategoryModel.findOnly({_id, uid: user.uid});
    const {name, description, friendsId} = body;
    if(!name) ctx.throw(400, '分组名不能为空');
    if(name.length > 20) ctx.throw(400, '分组名不能超过20个字');
    const sameNameCategory = await db.FriendsCategoryModel.findOne({uid: user.uid, name, _id: {$ne: category._id}});
    if(sameNameCategory) ctx.throw(400, '分组名已存在');
    if(!description) ctx.throw(400, '分组介绍不能为空');
    if(description.length > 250) ctx.throw(400, '分组介绍不能超过20个字');
    const friendsUid = [];
    for(const uid of friendsId) {
      const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
      if(!friend) continue;
      friendsUid.push(uid);
    }
    category.name = name;
    category.description = description;
    const oldFriendsId = category.friendsId;
    category.friendsId = friendsUid;
    category.tlm = Date.now();
    await category.save();

    await db.FriendModel.updateMany({uid: user.uid, tUid: {$in: friendsUid}}, {$addToSet: {cid: _id}});
    await db.FriendModel.updateMany({uid: user.uid, tUid: {$nin: friendsUid}}, {$pull: {cid: _id}});

    const allFriendsId = oldFriendsId.concat(friendsUid);

    const friends = await db.FriendModel.find({uid: user.uid, tUid: {$in: allFriendsId}});

    for(const friend of friends) {
      friend.targetUser = await db.UserModel.findOnly({uid: friend.tUid});
      await redis.pubMessage({
        ty: 'modifyFriend',
        friend: friend.toObject()
      });
    }

    data.category = category;
    await redis.pubMessage({
      ty: 'editFriendCategory',
      editType: 'modify',
      category: category
    });
    await next();
  })
  .del('/:_id', async (ctx, next) => {
    const {data, db, params, redis} = ctx;
    const {user} = data;
    const {_id} = params;
    const category = await db.FriendsCategoryModel.findOnly({ _id, uid: user.uid});
    await db.FriendModel.updateMany({uid: user.uid, tUid: {$in: category.friendsId}}, {$pull: {cid: _id}});
    const friends = await db.FriendModel.find({uid: user.uid, tUid: {$in: category.friendsId}});
    await category.remove();
    for(const friend of friends) {
      friend.targetUser = await db.UserModel.findOnly({uid: friend.tUid});
      await redis.pubMessage({
        ty: 'modifyFriend',
        friend: friend.toObject()
      });
    }
    await redis.pubMessage({
      ty: 'editFriendCategory',
      editType: 'remove',
      category: category
    });
    await next();
  });

module.exports = router;
