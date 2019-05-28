const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {params, db, body} = ctx;
    const {pid} = params;
    const {reason} = body;
    if(!reason) ctx.throw(400, "请输入理由");
    const post = await db.PostModel.findOnly({pid});
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
    const type = thread.oc === pid? "warningThread": "warningPost";
    const message = db.MessageModel({
      _id: await db.SettingModel.operateSystemID("messages", 1),
      r: post.uid,
      ty: "STU",
      c: {
        type: type,
        pid,
        tid: post.tid,
        rea: reason
      }
    });
    await message.save();
    ctx.redis.pubMessage(message);
    await next();
  });
module.exports = router;