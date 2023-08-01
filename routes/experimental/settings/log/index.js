const Router = require('koa-router');
const logSettingRouter = new Router();
const { getLoggerOperationsId } = require('../../../../nkcModules/permission');
logSettingRouter.get('/', async (ctx, next) => {
  const { data, db, state } = ctx;
  const operationsId = getLoggerOperationsId();
  data.operations = operationsId.map((operationId) => {
    return {
      operationId,
      operationName: state.lang('operations', operationId),
    };
  });
  data.logSettings = await db.SettingModel.getSettings('log');
  ctx.template = 'experimental/settings/log.pug';
  await next();
});
module.exports = logSettingRouter;
