const Router = require('koa-router');
const { Public, OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const historyRouter = new Router();
historyRouter.get('/', Public(), async (ctx, next) => {
  const { data, db } = ctx;
  data.funds = await db.FundModel.find({ history: true, disabled: false });
  ctx.template = 'fund/list/fundList.pug';
  data.type = 'history';
  await next();
});
module.exports = historyRouter;
