const router = require('koa-router')();
const { OnlyUnbannedUser } = require('../../middlewares/permission');
router
  .get('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { db, data, state } = ctx;
    let categories = await db.ResourceCategoryModel.find({
      uid: state.uid,
    }).sort({ order: 1 });
    categories = await db.ResourceCategoryModel.extendCount(categories);
    data.categories = categories;
    await next();
  })
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    //添加或修改分类
    const { db, state, body, nkcModules } = ctx;
    const { name, type, _id } = body;
    const { checkString } = nkcModules.checkData;

    const oldCategory = await db.ResourceCategoryModel.findOne({
      uid: state.uid,
      name,
    });
    if (oldCategory || name === '默认') {
      ctx.throw(403, '已存在相同分组名');
    }
    if (type === 'create') {
      checkString(name, {
        name: '文件名',
        minLength: 1,
        maxLength: 16,
      });
      const count = await db.ResourceCategoryModel.countDocuments({
        uid: state.uid,
      });
      if (count === 10) {
        ctx.throw(403, '最多添加10个分组');
      }
      const category = db.ResourceCategoryModel({
        _id: await db.SettingModel.operateSystemID('resourceCategory', 1),
        name,
        uid: state.uid,
        order: count,
      });
      await category.save();
    } else if (type === 'modify') {
      checkString(name, {
        name: '文件名',
        minLength: 1,
        maxLength: 16,
      });
      await db.ResourceCategoryModel.updateOne(
        { _id },
        {
          $set: {
            name,
            tlm: new Date(),
          },
        },
      );
    } else if (type === 'delete') {
      let resources = await db.ResourceModel.find({ cid: _id });
      if (resources.length !== 0) {
        ctx.throw(400, '当前分组下有资源，不可删除');
      }
      //删除分组
      await db.ResourceCategoryModel.deleteOne({ _id });
    }
    await ctx.nkcModules.socket.sendGroupMessage(ctx.state.uid);
    await next();
  })
  .post('/move', OnlyUnbannedUser(), async (ctx, next) => {
    const { db, data, body, params } = ctx;
    const { resources, cid } = body;
    await db.ResourceModel.updateMany(
      { rid: { $in: resources } },
      {
        $set: {
          cid: cid === 'default' ? '' : cid,
        },
      },
    );
    await next();
  })
  .post('/order', OnlyUnbannedUser(), async (ctx, next) => {
    //更改分组顺序
    const { db, body, data } = ctx;
    const { orders } = body;
    for (const o of orders) {
      const { cid, order } = o;
      await db.ResourceCategoryModel.updateOne(
        { _id: cid },
        {
          $set: {
            order,
          },
        },
      );
    }
    await next();
  });
module.exports = router;
