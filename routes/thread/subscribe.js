const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {tid} = params;
    const {user} = data;
    const thread = await db.ThreadModel.findOne({tid});
    if(!thread) ctx.throw(404, "文章不存在");
    const q = {
      type: "thread",
      tid,
      uid: user.uid
    };
    let sub = await db.SubscribeModel.findOne(q);
    if(sub) {
      ctx.throw(400, "文章已关注，请刷新");
    } else {
      q.detail = "sub";
      q._id = await db.SettingModel.operateSystemID("subscribes", 1);
      await db.SubscribeModel(q).save();
    }
    await next();
  })
  .del("/", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {tid} = params;
    const {user} = data;
    await db.SubscribeModel.remove({
      type: "thread",
      tid,
      uid: user.uid
    });
    await next();
  });
module.exports = router;