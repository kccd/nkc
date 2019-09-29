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
    data.secrets = await Promise.all(secrets.map(async s => {
      s = s.toObject();
      s.user = await db.UserModel.findOne({uid: s.uid});
      if(["bindEmail", "changeEmail"].includes(s.operationId)) {
        s.beforeData = s.oldEmail;
        s.afterData = s.newEmail || s.email;
        s.type = "email";
      } else if(["bindMobile", "modifyMobile"].includes(s.operationId)) {
        s.type = "mobile";
        if(s.oldMobile)
          s.beforeData = "+" + s.oldNationCode + " " + s.oldMobile;
        s.afterData = "+" + (s.newNationCode || s.nationCode) + " " + (s.newMobile || s.mobile);
      } else if(s.operationId === "modifyPassword") {
        s.type = "password";
      } else {
        s.beforeData = s.oldUsername;
        s.afterData = s.newUsername;
        s.type = "username";
      }
      return s;
    }));
    data.paging = paging;
    ctx.template = 'experimental/log/secret.pug';
    await next();
  });
  /*.get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, type} = query;
    let queryMap;
    data.type = type;
    if(!type){
      queryMap = {}
    }
    if(type === "email"){
      queryMap = {"operationId":{"$in":["bindEmail", "changeEmail"]}}
    }
    if(type === "password"){
      queryMap = {"operationId":"modifyPassword"}
    }
    if(type === "mobile"){
      queryMap = {"operationId":{"$in":["bindMobile", "modifyMobile"]}}
    }
    if(type === "username"){
      queryMap = {"operationId":"modifyUsername"}
    }
    const count = await db.SecretBehaviorModel.count(queryMap);
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    const secretBehaviors = await db.SecretBehaviorModel.find(queryMap).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    data.result = await Promise.all(secretBehaviors.map(async behavior => {
      await behavior.extendUser();
      await behavior.extendOperationName();
      return behavior;
    }));
    ctx.template = 'experimental/log/secret.pug';
    await next()
  });*/