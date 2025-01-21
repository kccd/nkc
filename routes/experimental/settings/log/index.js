const Router = require('koa-router');
const logSettingRouter = new Router();
const { getLoggerOperationsId } = require('../../../../nkcModules/permission');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
logSettingRouter.get(
  '/',
  OnlyOperation(Operations.logParamsSetting),
  async (ctx, next) => {
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
  },
);
module.exports = logSettingRouter;
