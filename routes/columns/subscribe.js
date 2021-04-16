const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    let {type, cid = []} = body;
    const {column, user} = data;
    if(type === "subscribe") {
      await user.ensureSubLimit("column");
      let sub = await db.SubscribeModel.findOne({uid: user.uid, type: "column", columnId: column._id});
      if(sub) ctx.throw(400, "您已经关注过该专栏了，请刷新");
      for(const typeId of cid) {
        const subType = await db.SubscribeTypeModel.findOne({_id: typeId, uid: user.uid});
        if(!subType) ctx.throw(400, `未找到ID为${typeId}的关注分类`);
      }
      await db.SubscribeModel({
        _id: await db.SettingModel.operateSystemID("subscribes", 1),
        uid: user.uid,
        columnId: column._id,
        cid,
        type: "column"
      }).save();
    } else {
      const sub = await db.SubscribeModel.findOne({type: "column", columnId: column._id, uid: user.uid});
      if(!sub) ctx.throw(400, "您暂未关注该专栏，请刷新");
      cid = sub.cid;
      await sub.deleteOne();
    }
    await db.SubscribeModel.saveUserSubColumnsId(user.uid);
    data.subCount = await db.SubscribeModel.countDocuments({type: "column", columnId: column._id});
    await column.updateOne({subCount: data.subCount});
    await db.SubscribeTypeModel.updateCount(cid);
    await next();
  });
module.exports = router;