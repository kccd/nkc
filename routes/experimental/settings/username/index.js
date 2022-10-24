const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    data.usernameSettings = await db.SettingModel.getSettings("username");
    data.scoreObject = await db.SettingModel.getScoreByOperationType("usernameScore");
    ctx.template = "experimental/settings/username/username.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body} = ctx;
    let {maxKcb, freeCount, onceKcb, free, sensitive} = body;
    maxKcb = parseInt(maxKcb);
    freeCount = parseInt(freeCount);
    onceKcb = parseInt(onceKcb);
    if(freeCount < 0) ctx.throw(400, "免费修改次数不能小于0");
    if(maxKcb < 0) ctx.throw(400, "花费积分最大值不能小于0");
    if(onceKcb < 0) ctx.throw(400, "花费积分增量不能小于0");
    const {words, usernameTip, descTip} = sensitive;
    if(!usernameTip) ctx.throw(400, '非法用户名提示不能为空');
    if(!descTip) ctx.throw(400, '非法用户简介提示不能为空');
    await db.SettingModel.updateOne({_id: "username"}, {
      $set: {
        "c.maxKcb": maxKcb,
        "c.freeCount": freeCount,
        "c.onceKcb": onceKcb,
        "c.free": !!free,
        "c.sensitive.words": words,
        "c.sensitive.usernameTip": usernameTip,
        "c.sensitive.descTip": descTip,
      }
    });
    await db.SettingModel.saveSettingsToRedis("username");
    await next();
  });
module.exports = router;
