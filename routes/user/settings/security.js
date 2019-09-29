const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data, params} = ctx;
    data.selected = "security";
    const {uid} = params;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid});
    data.havePassword = true;
    const {hash, salt} = userPersonal.password;
    if(!hash || !salt) data.havePassword = false;
    let {mobile, nationCode, email} = userPersonal;
    if(mobile) mobile = mobile.slice(0, 3) + "****" + mobile.slice(7);
    if(email) email = email.replace(/.{4}@/ig, "****@");
    data.mobile = mobile;
    data.userEmail = email;
    data.nationCode = nationCode;
    ctx.template = "interface_user_settings_security.pug";
    await next();
  });
module.exports = router;