const path = require("path");
const Router = require('koa-router');

const verifyRouter = new Router();
verifyRouter
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    data.selected = "verify";
    const {user} = data;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    data.boundMobile = !!userPersonal.mobile;
    const authenticate = userPersonal.authenticate;
    if(authenticate.card.status === "passed" && authenticate.card.expiryDate.getTime() < Date.now()) {
      authenticate.card.isExpired = true;
      await userPersonal.updateOne({
        $set: { "authenticate.card.status": "unsubmit" }
      });
    }
    if(authenticate.video.status === "passed" && authenticate.video.expiryDate.getTime() < Date.now()) {
      authenticate.video.isExpired = true;
      await userPersonal.updateOne({
        $set: { "authenticate.video.status": "unsubmit" }
      });
    }
    const authSettings = await db.SettingModel.getSettings('auth');
    data.auth3Content = authSettings.auth3Content;
    data.authenticate = userPersonal.authenticate;
    ctx.template = "/user/settings/verify/verify.pug";
    await next();
  })
  .post("/verify2_form", async (ctx, next) => {
    const { data, body, db} = ctx;
    const { user } = data;
    const { files } = body;
    const { surfaceA, surfaceB } = files;
    const userPersonal = await db.UsersPersonalModel.findOne({ uid: user.uid });
    //判断身份认证等级
    if(await userPersonal.getAuthLevel() < 1) {
			ctx.throw("身份认证1、2、3需要按顺序依次通过认证，请先完成身份认证1");
		}
    if(!surfaceA || !surfaceB) {
      return ctx.throw("请上传身份证正反面2张照片");
    }
    //生成身份认证2
    await userPersonal.generateAuthenticateVerify2([surfaceA, surfaceB]);
    return next();
  })
  .post("/verify3_form", async (ctx, next) => {
    const { data, body, db} = ctx;
    const { user } = data;
    const { files, fields } = body;
    const file = files.video;
    const code = fields.code;
    // 生成验证信息记录，状态置为审核中
    const userPersonal = await db.UsersPersonalModel.findOne({ uid: user.uid });
    if(await userPersonal.getAuthLevel() < 2) {
			ctx.throw("身份认证1、2、3需要按顺序依次通过认证，请先完成身份认证2");
		}
    const ext = path.extname(file.name);
    if(ext !== ".mp4") {
      return ctx.throw(400, '视频格式只能为.mp4');
    }
    if(file.size > 314572800 /* 300 *1024 *1024 */) ctx.throw(400, "视频大小不能超过300M！");
    await userPersonal.generateAuthenticateVerify3(file, code);
    return next();
  });

  // 查看认证者上传的认证材料路由
  // user -> verifiedAssets.js

module.exports = verifyRouter;