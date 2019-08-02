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
      await nkcModules.file.deleteUserAvatar(targetUser.uid);
    } else if(type === "banner") {
      await nkcModules.file.deleteUserBanner(targetUser.uid);
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