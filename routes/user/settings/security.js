const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data, params} = ctx;
    const {uid} = params;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid});
    data.havePassword = true;
    const {password, salt} = userPersonal.password;
    if(!password || !salt) data.havePassword = false;
    ctx.template = "interface_user_settings_security.pug";
    await next();
  });
module.exports = router;