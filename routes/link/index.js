const Router = require("koa-router");
const router = new Router();
const OffsiteLinkModel = require("../../dataModels/OffsiteLinkModel");
const SettingModel = require("../../dataModels/SettingModel");
const base64js = require("base64-js");

router
  .get("/", async (ctx, next) => {
    const { data, header } = ctx;
    const { target } = ctx.query;
    const { user } = data;
    const byteArray = base64js.toByteArray(target);
    const url = String.fromCharCode(...byteArray);
    const doc = await OffsiteLinkModel.create({
      target: url,
      referer: header.referer,
      uid: user? user.uid : null
    });
    const threadSettings = await SettingModel.getSettings("thread");
    const serverSettings = await SettingModel.getSettings("server");
    data.id = doc._id;
    data.target = target;
    data.confirm = threadSettings.offsiteLink.confirm
    data.siteName = serverSettings.websiteAbbr;
    ctx.template = "/link/link.pug"
    return next();
  })
  // 用户确认继续访问站外链接前，上报状态，或者下发访问控制
  .post("/report", async (ctx, next) => {
    const { body } = ctx;
    const { user } = ctx.data;
    const { accept, id } = body;
    await OffsiteLinkModel.updateOne({ uid: user? user.uid : null, _id: id }, {
      $set: {
        accessAt: Date.now(),
        isComplete: accept
      }
    });
    return next();
  });

module.exports = router;