const Router = require('koa-router');
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
const disabledRouter = new Router();
disabledRouter.get(
  '/',
  OnlyOperation(Operations.visitDisabledFundList),
  async (ctx, next) => {
    const { data, db } = ctx;
    data.funds = await db.FundModel.find({ disabled: true });
    ctx.template = 'fund/list/disabledFund.pug';
    await next();
  },
);
module.exports = disabledRouter;
