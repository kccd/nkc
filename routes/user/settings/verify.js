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
    const verifiedUploadVideo = await db.VerifiedUploadModel.findOne({_id: userPersonal.authenticate.video.attachments[0]}, {state: 1, _id: 1}).sort({toc: -1});
    const verifiedUploadCardA = await db.VerifiedUploadModel.findOne({_id: userPersonal.authenticate.card.attachments[0]}, {state: 1, _id: 1}).sort({toc: -1});
    const verifiedUploadCardB = await db.VerifiedUploadModel.findOne({_id: userPersonal.authenticate.card.attachments[1]}, {state: 1, _id: 1}).sort({toc: -1});
    data.verifiedVideoState = verifiedUploadVideo?verifiedUploadVideo.state:'unUpload';
    data.verifiedAState = verifiedUploadCardA?verifiedUploadCardA.state:'unUpload';
    data.verifiedBState = verifiedUploadCardB?verifiedUploadCardB.state:'unUpload';
    data.auth3Content = authSettings.auth3Content;
    data.auth2Content = authSettings.auth2Content;
    data.auth1Content = authSettings.auth1Content;
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
    // 获取视频文件的后缀名
    const ext = path.extname(file.name);
    if(![".mp4" , ".mov" , ".3gp" , ".avi"].includes(ext)) {
      return ctx.throw(400, '视频格式只能为.mp4, .mov, .3gp, .avi 您上传的格式为'+ext);
    }
    await userPersonal.generateAuthenticateVerify3(file, code);
    return next();
  });

  // 查看认证者上传的认证材料路由
  // user -> verifiedAssets.js

module.exports = verifyRouter;
