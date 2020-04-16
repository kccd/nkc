const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "experimental/login/login.pug";
    await next();
  })
  .post("/", async (ctx, next) =>{
    const {data, body, db, nkcModules} = ctx;
    const exConfig = await nkcModules.apiFunction.getConfigByName("experimental");
    const {password} = body;
    if(!nkcModules.apiFunction.testPassword(password, "sha256HMAC", {
      salt: exConfig.salt,
      hash: exConfig.hash
    })) {
      ctx.throw(400, "密码错误");
    }
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: data.user.uid});
    ctx.setCookie("experimental", {
      uid: data.user.uid,
      p: userPersonal.secret,
      lastLogin: exConfig.secret,
      time: Date.now()
    });
    data.redirect = "/e/console";
    await next();
  });
module.exports = router;