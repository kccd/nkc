const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {type} = body;
    const {column, user} = data;
    if(type === "subscribe") {
      let sub = await db.SubscribeModel.findOne({uid: user.uid, type: "column", columnId: column._id});
      if(sub) ctx.throw(400, "您已经订阅过该专栏了，请刷新");
      await db.SubscribeModel({
        _id: await db.SettingModel.operateSystemID("subscribes", 1),
        uid: user.uid,
        columnId: column._id,
        type: "column"
      }).save();
    } else {
      await db.SubscribeModel.remove({type: "column", columnId: column._id, uid: user.uid});
    }
    data.subCount = await db.SubscribeModel.count({type: "column", columnId: column._id});
    await column.update({subCount: data.subCount});
    await next();
  });
module.exports = router;