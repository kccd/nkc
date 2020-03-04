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
      const user = await db.UserModel.findOne({usernameLowerCase: c.toLowerCase()});
      if(!user) {
        q.uid = "null";
      } else {
        q.uid = user.uid;
      }
    } else if(t === "ip") {
      q.ip = c;
    } else if(t === "uid") {
      q.uid = c;
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
      if(["bindEmail", "modifyEmail"].includes(type)) {
        secret.beforeData = oldEmail;
        secret.afterData = newEmail;
      } else if(["bindMobile", "modifyMobile"].includes(type)) {
        if(secret.oldMobile) {
          secret.beforeData = "+" + oldNationCode + " " + oldMobile;
        }
        secret.afterData = "+" + newNationCode + " " + newMobile;
      } else if(["destroy", "modifyUsername"].includes(type)) {
        secret.beforeData = oldUsername;
        secret.afterData = newUsername;
      }
      data.secrets.push(secret);
    }
    data.paging = paging;
    ctx.template = 'experimental/log/secret.pug';
    await next();
  });