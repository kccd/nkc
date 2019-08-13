const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, nkcModules, state, db} = ctx;
    data.loginSettings = await db.SettingModel.getSettings("login");
    const operations = await db.OperationModel.find().sort({toc: 1});
    data.operations = operations.map(o => {
      return {
        _id: o._id,
        name: state.lang("operations", o._id)
      };
    });
    ctx.template = "experimental/settings/login/login.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {nkcModules, db, body} = ctx;
    let {redirectOperationsId, maxLoginCountOneHour} = body;
    const operationsId = nkcModules.permission.getOperationsId();
    maxLoginCountOneHour = parseInt(maxLoginCountOneHour);
    if(maxLoginCountOneHour < 1) ctx.throw(400, "最大尝试登录次数不能小于1");
    redirectOperationsId = redirectOperationsId.filter(id => operationsId.includes(id));
    await db.SettingModel.updateOne({_id: "login"}, {
      $set: {
        "c.maxLoginCountOneHour": maxLoginCountOneHour,
        "c.redirectOperationsId": redirectOperationsId
      }
    });
    await db.SettingModel.saveSettingsToRedis("login");
    await next();
  });
module.exports = router;