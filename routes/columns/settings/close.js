const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "columns/settings/close.pug";
    const {data, db} = ctx;
    const columnSettings = await db.SettingModel.findById("column");
    data.columnSettings = columnSettings.c;
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {column, user} = data;
    const {password} = body;
    const usersPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    await usersPersonal.ensurePassword(password);
    await column.updateOne({
      closed: true
    });
    await next();
  });
module.exports = router;