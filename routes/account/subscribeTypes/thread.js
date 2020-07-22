const router = require("koa-router")();
router
  .use("/", async (ctx, next) => {
    const {data, db, params} = ctx;
    const {user} = data;
    const {tid} = params;
    const type = await db.SubscribeTypeModel.findOne({uid: user.uid, _id: tid});
    if(!type) ctx.throw(400, `未找到ID为${tid}的关注分类`);
    if(type.type) ctx.throw(400, `默认分类无法更改`);
    data.subscribeType = type;
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, data, body, tools} = ctx;
    const {contentLength} = tools.checkString;
    const {subscribeType, user} = data;
    const {type} = body;
    if(type === "info") {
      let {name, pid = null} = body;
      if(!name) ctx.throw(400, "分类名不能为空");
      if(contentLength(name) > 20) ctx.throw(400, "分类名不能超过20字符");
      if(pid) {
        const parentType = await db.SubscribeTypeModel.findOne({uid: user.uid, _id: pid});
        if(!parentType) ctx.throw(400, `未找到ID为${pid}的关注分类`);
        const childTypesCount = await db.SubscribeTypeModel.count({uid: user.uid, pid: subscribeType._id});
        if(childTypesCount) ctx.throw(400, "该分类下存在子分类，无法将该分类设置成子分类");
      }
      const sameName = await db.SubscribeTypeModel.findOne({name, uid: user.uid, _id: {$ne: subscribeType._id}});
      if(sameName) ctx.throw(400, "分类名已存在");
      await subscribeType.update({
        name,
        pid
      });
    } else if(type === "order") {
      const {direction} = body;
      let types = [];
      if(subscribeType.pid) {
        types = await db.SubscribeTypeModel.find({uid: user.uid, pid: subscribeType.pid}).sort({order: 1});
      } else {
        types = await db.SubscribeTypeModel.find({uid: user.uid, pid: null}).sort({order: 1});
      }
      const typesId = types.map(t => t._id);
      const index = typesId.indexOf(subscribeType._id);
      if(index === -1) return await next();
      if(
        (direction === "up" && index === 0) ||
        (direction === "down" && (index+1) === typesId.length)
      ) return await next();

      if(direction === "up") {
        typesId.splice(index, 1);
        typesId.splice(index-1, 0, subscribeType._id);
      } else if(direction === "down") {
        typesId.splice(index, 1);
        typesId.splice(index+1, 0, subscribeType._id);
      }
      for(let i = 0; i < typesId.length; i++) {
        var _id = typesId[i];
        await db.SubscribeTypeModel.updateOne({_id}, {
          $set: {
            order: i
          }
        });
      }
    }
    await next();
  })
  .del("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {subscribeType, user} = data;
    const childTypesCount = await db.SubscribeTypeModel.count({uid: user.uid, pid: subscribeType._id});
    if(childTypesCount) ctx.throw(400, "分类下存在子分类，无法删除");
    const subCount = await db.SubscribeModel.count({uid: user.uid, cid: subscribeType._id});
    if(subCount) ctx.throw(400, "分类下存在关注的内容，无法删除");
    await subscribeType.remove();
    await next();
  });
module.exports = router;
