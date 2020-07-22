const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {data, params, db, body} = ctx;
    const {pid} = params;
    const {reason} = body;
    if(!reason) ctx.throw(400, "请输入理由");
    const post = await db.PostModel.findOnly({pid});
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
    const type = thread.oc === pid? "warningThread": "warningPost";
    const warning = await db.PostWarningModel({
      _id: await db.SettingModel.operateSystemID("postWarnings", 1),
      tUid: post.uid,
      type,
      handlerId: data.user.uid,
      tid: thread.tid,
      pid: post.pid,
      reason
    });
    await warning.save();
    const message = db.MessageModel({
      _id: await db.SettingModel.operateSystemID("messages", 1),
      r: post.uid,
      ty: "STU",
      c: {
        type: type,
        pid,
        tid: post.tid,
        warningId: warning._id,
        rea: reason
      }
    });
    await message.save();
    ctx.redis.pubMessage(message);
    await next();
  })
  .put("/", async (ctx, next) =>{
    const {data, db, body} = ctx;
    const {warningId, reason} = body;
    const {user} = data;
    const warning = await db.PostWarningModel.findOnly({_id: warningId});
    if(!reason) ctx.throw(400, "修改建议不能为空");
    await warning.update({
      reason,
      modifierId: user.uid,
      modifiedTime: new Date()
    });
    await db.MessageModel.updateOne({
      ty: "STU",
      "c.warningId": warningId
    }, {
      $set: {
        "c.rea": reason
      }
    });
    await next();
  });
module.exports = router;
