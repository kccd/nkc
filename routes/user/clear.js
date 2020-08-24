const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {settings, db, body, params, nkcModules} = ctx;
    const {uid} = params;
    const targetUser = await db.UserModel.findOnly({uid});
    const serverSettings = await db.SettingModel.getSettings('server');
    const {type} = body;
    const time = Date.now();
    if(type === "avatar") {
      await nkcModules.file.deleteUserAvatar(targetUser.uid);
    } else if(type === "banner") {
      await nkcModules.file.deleteUserBanner(targetUser.uid);
    } else if(type === "username") {
      const newUsername = `${serverSettings.websiteCode}-${targetUser.uid}`;
      const newUsernameLowerCase = newUsername.toLowerCase();
      await db.SecretBehaviorModel({
        operationId: "modifyUsername",
        type: "modifyUsername",
        uid: targetUser.uid,
        ip: ctx.address,
        port: ctx.port,
        oldUsername: targetUser.username,
        oldUsernameLowerCase: targetUser.usernameLowerCase,
        newUsername: newUsername,
        newUsernameLowerCase: newUsernameLowerCase
      }).save();
      await db.UserModel.updateOne({uid}, {
        $set: {
          username: newUsername,
          usernameLowerCase: newUsernameLowerCase
        }
      });
      targetUser.username = newUsername;
      targetUser.usernameLowerCase = newUsernameLowerCase;
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
