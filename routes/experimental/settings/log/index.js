const Router = require('koa-router');
const logSettingRouter = new Router();
logSettingRouter
  .use('/', async (ctx, next) => {
    const {data, db, state} = ctx;
    data.operations = await db.OperationModel.find().sort({toc: 1});
    data.logSettings = state.logSettings;
    await next();
  })
  .get('/', async (ctx, next) => {
    ctx.template = 'experimental/settings/log.pug';
    await next();
  })
  .post('/', async(ctx, next) => {
    const {data, db, body} = ctx;
    let {selectedOperationsId} = body;
    const {operations} = data;
    const operationsId = operations.map(o => o._id);
    selectedOperationsId = selectedOperationsId.filter(o => operationsId.includes(o));
    await db.SettingModel.updateOne({
      _id: "log"
    }, {
      $set: {
        "c.operationsId": selectedOperationsId
      }
    });
    await db.SettingModel.saveSettingsToRedis("log");
    await next();
  });
module.exports = logSettingRouter;