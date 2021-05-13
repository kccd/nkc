const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {params, db, data, body} = ctx;
    const {tid} = params;
    const {user} = data;
    const {cid = []} = body;
    const thread = await db.ThreadModel.findOne({tid});
    if(!thread) ctx.throw(404, "文章不存在");
    const q = {
      type: "thread",
      tid,
      cancel: false,
      uid: user.uid
    };
    let sub = await db.SubscribeModel.findOne(q);
    for(const typeId of cid) {
      const subType = await db.SubscribeTypeModel.findOne({_id: typeId, uid: user.uid});
      if(!subType) ctx.throw(400, `未找到ID为${typeId}的关注分类`);
    }
    if(sub) {
      ctx.throw(400, "文章已关注，请刷新");
    } else {
      await user.ensureSubLimit("thread");
      q.detail = "sub";
      q.cid = cid;
      q.cancel = false;
      q._id = await db.SettingModel.operateSystemID("subscribes", 1);
      await db.SubscribeModel(q).save();
      await db.SubscribeModel.saveUserSubThreadsId(user.uid);
    }
    await db.SubscribeTypeModel.updateCount(cid);
    await next();
  })
  .del("/", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {tid} = params;
    const {user} = data;
    const sub = await db.SubscribeModel.findOne({
      type: "thread",
      cancel: false,
      tid,
      uid: user.uid
    });
    let cid = [];
    if(sub) {
      cid = sub.cid;
      await sub.cancelSubscribe();
      // await sub.deleteOne();
      await db.SubscribeTypeModel.updateCount(cid);
      await db.SubscribeModel.saveUserSubThreadsId(user.uid);
    }
    await next();
  });
module.exports = router;