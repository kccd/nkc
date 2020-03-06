const Router = require('koa-router');
const router = new Router();
module.exports = router;
router
  .get("/", async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    const {page = 0, t, c = ""} = query;
    const q = {};
    data.t = t;
    data.c = c;
    if(t === "username") {
      q.$or = [
        {
          oldUsernameLowerCase: c.toLowerCase()
        },
        {
          newUsernameLowerCase: c.toLowerCase()
        }
      ];
      const user = await db.UserModel.findOne({usernameLowerCase: c.toLowerCase()});
      if(user) {
        q.$or.push({
          uid: user.uid
        });
      }
    } else if(t === "ip") {
      q.ip = c;
    } else if(t === "uid") {
      q.uid = c;
    } else if(t === "email") {
      q.$or = [
        {
          oldEmail: c.toLowerCase()
        },
        {
          newEmail: c.toLowerCase()
        }
      ]
    } else if(t === "mobile") {
      q.$or = [
        {
          oldMobile: c
        },
        {
          newMobile: c
        }
      ];
    }
    const count = await db.SecretBehaviorModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const secrets = await db.SecretBehaviorModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.secrets = [];
    for(let secret of secrets) {
      secret = secret.toObject();
      const {
        type, oldEmail, newEmail, oldNationCode, newNationCode,
        newMobile, oldMobile,
        oldUsername, newUsername
      } = secret;
      secret.user = await db.UserModel.findOne({uid: secret.uid});
      if(["bindEmail", "changeEmail", "unbindEmail"].includes(type)) {
        secret.beforeData = oldEmail;
        secret.afterData = newEmail;
      } else if(["bindMobile", "modifyMobile", "unbindMobile"].includes(type)) {
        if(secret.oldMobile) {
          secret.beforeData = "+" + oldNationCode + " " + oldMobile;
        }
        if(secret.newMobile) {
          secret.afterData = "+" + newNationCode + " " + newMobile;
        }
      } else if(["modifyUsername"].includes(type)) {
        secret.beforeData = oldUsername;
        secret.afterData = newUsername;
      }
      data.secrets.push(secret);
    }
    data.paging = paging;
    ctx.template = 'experimental/log/secret.pug';
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {type, id} = body;
    const log = await db.SecretBehaviorModel.findOnly({_id: id});
    if(type === "restore") {
      let {
        type, uid,
        oldMobile, newMobile,
        oldNationCode, newNationCode,
        oldEmail, newEmail,
        oldHashType, newHashType,
        oldHash, newHash,
        oldSalt, newSalt,
        oldAvatar, newAvatar,
        oldBanner, newBanner,
        oldUsername, newUsername,
        oldUsernameLowerCase, newUsernameLowerCase,
        oldDescription, newDescription,
        oldPostSign, newPostSign
      } = log;
      if(type !== "destroy") ctx.throw(400, "仅支持恢复注销d的数据");
      const targetUser = await db.UserModel.findOnly({uid});
      if(!targetUser.destroyed) ctx.throw(400, "账号未注销或已恢复");
      const newBehavior = {
        uid,
        type: "restoreAccount",
        oldHashType: newHashType,
        newHashType: oldHashType,
        oldHash: newHash,
        newHash: oldHash,
        oldSalt: newSalt,
        newSalt: oldSalt,
        oldAvatar: newAvatar,
        newAvatar: oldAvatar,
        oldBanner: newBanner,
        newBanner: oldBanner,
        oldDescription: newDescription,
        newDescription: oldDescription,
        oldPostSign: newPostSign,
        newPostSign: oldPostSign,
        oldUsername: newUsername,
        oldUserNameLowerCase: newUsernameLowerCase,
        oldEmail: newEmail,
        oldMobile: newMobile,
        oldNationCode: newNationCode,
        ip: ctx.address,
        port: ctx.port
      };
      const sameUsernameCount = await db.UserModel.count({usernameLowerCase: oldUsernameLowerCase});
      const warning = [];
      if(sameUsernameCount > 0) {
        newBehavior.newUsername = newUsername;
        newBehavior.newUsernameLowerCase = newUsernameLowerCase;
        warning.push("用户名冲突");
      } else {
        newBehavior.newUsername = oldUsername;
        newBehavior.newUsernameLowerCase = oldUsernameLowerCase;
      }
      const sameEmailCount = await db.UsersPersonalModel.count({email: oldEmail});
      if(sameEmailCount > 0) {
        newBehavior.newEmail = newEmail;
        warning.push("邮箱冲突");
      } else {
        newBehavior.newEmail = oldEmail;
      }
      const sameMobileCount = await db.UsersPersonalModel.count({mobile: oldMobile, nationCode: oldNationCode});
      if(sameMobileCount > 0) {
        newBehavior.newMobile = newMobile;
        newBehavior.newNationCode = newNationCode;
        warning.push("手机号冲突");
      } else {
        newBehavior.newMobile = oldMobile;
        newBehavior.newNationCode = oldNationCode;
      }
      const behavior = db.SecretBehaviorModel(newBehavior);
      await behavior.save();
      await db.UserModel.updateOne({uid}, {
        $set: {
          username: newBehavior.newUsername,
          usernameLowerCase: newBehavior.newUsernameLowerCase,
          description: newBehavior.newDescription,
          postSign: newBehavior.newPostSign,
          avatar: newBehavior.newAvatar,
          banner: newBehavior.newBanner,
          destroyed: false
        }
      });
      await db.UsersPersonalModel.updateOne({uid}, {
        $set: {
          hashType: behavior.newHashType,
          password: {
            hash: behavior.newHash,
            salt: behavior.newSalt
          },
          mobile: behavior.newMobile,
          nationCode: behavior.newNationCode,
          email: behavior.newEmail
        }
      });
      data.warning = warning;
    }
    await next();
  });
