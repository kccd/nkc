const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "interface_user_settings_display.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {homeThreadList} = body;
    if(!["subscribe", "latest"].includes(homeThreadList)) ctx.throw(400, `参数homeThreadList错误：${homeThreadList}`);
    await db.UsersGeneralModel.updateOne({uid: data.user.uid}, {
      $set: {
        "displaySettings.homeThreadList": homeThreadList
      }
    });
    await next();
  });
module.exports = router;
