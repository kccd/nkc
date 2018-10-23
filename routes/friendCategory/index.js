const Router = require('koa-router');
const router = new Router();

router
  .post('/', async (ctx, next) => {
    const {body, data, db, redis} = ctx;
    const {user} = data;
    const {name, description, friendsId} = body;
    if(!name) ctx.throw(400, '分组名不能为空');
    if(name.length > 20) ctx.throw(400, '分组名不能超过20个字');
    if(!description) ctx.throw(400, '分组介绍不能为空');
    if(description.length > 250) ctx.throw(400, '分组介绍不能超过20个字');
    const friendsUid = [];
    for(const uid of friendsId) {
      const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
      if(!friend) continue;
      friendsUid.push(uid);
    }
    const category = db.FriendsCategoryModel({
      _id: await db.SettingModel.operateSystemID('friendsCategories', 1),
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
  .patch('/:_id', async (ctx, next) => {
    const {body, data, db, params,redis} = ctx;
    const {_id} = params;
    const {user} = data;
    const category = await db.FriendsCategoryModel.findOnly({_id, uid: user.uid});
    const {name, description, friendsId} = body;
    if(!name) ctx.throw(400, '分组名不能为空');
    if(name.length > 20) ctx.throw(400, '分组名不能超过20个字');
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
    category.friendsId = friendsUid;
    category.tlm = Date.now();
    await category.save();
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
    await category.remove();
    await redis.pubMessage({
      ty: 'editFriendCategory',
      editType: 'remove',
      category: category
    });
    await next();
  });

module.exports = router;