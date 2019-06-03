const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {settings, db, body, params, nkcModules} = ctx;
    const {uid} = params;
    const targetUser = await db.UserModel.findOnly({uid});
    const {type} = body;
    const time = Date.now();
    if(type === "avatar") {
      try{
        await ctx.fs.rename(
          `${settings.upload.avatarPath}/${targetUser.uid}.jpg`,
          `${settings.upload.avatarPath}/${targetUser.uid}_${time}.jpg`
        );
      } catch(err){}
      try{
        await ctx.fs.rename(
          `${settings.upload.avatarSmallPath}/${targetUser.uid}.jpg`,
          `${settings.upload.avatarSmallPath}/${targetUser.uid}_${time}.jpg`
        );
      } catch(err){}
      try{
        await ctx.fs.rename(
          `${settings.upload.avatarLargePath}/${targetUser.uid}.jpg`,
          `${settings.upload.avatarLargePath}/${targetUser.uid}_${time}.jpg`
        );
      } catch(err){}
    } else if(type === "banner") {
      try{
        await ctx.fs.rename(
          `${settings.upload.userBannerPath}/${targetUser.uid}.jpg`,
          `${settings.upload.userBannerPath}/${targetUser.uid}_${time}.jpg`,
        );
      } catch(err){}
    } else if(type === "username") {
      await db.SecretBehaviorModel({
        operationId: "modifyUsername",
        type: "modifyUsername",
        uid: targetUser.uid,
        ip: ctx.address,
        port: ctx.port,
        oldUsername: targetUser.username,
        oldUsernameLowerCase: targetUser.usernameLowerCase,
        newUsername: "",
        newUsernameLowerCase: ""
      }).save();
      await db.UserModel.updateOne({uid}, {
        $set: {
          username: "",
          usernameLowerCase: ""
        }
      });
      targetUser.username = "";
      targetUser.usernameLowerCase = "";
      await nkcModules.elasticSearch.save("user", targetUser);
    } else if(type === "description") {
      await db.UserModel.updateOne({uid}, {
        $set: {
          description: ""
        }
      });
      targetUser.description = "";
      await nkcModules.elasticSearch.save("user", targetUser);
    }
    await next();
  });
module.exports = router;