const Router = require('koa-router');
const applicationRouter = new Router();
applicationRouter
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {fundId} = ctx.params;
    data.fund = await db.FundModel.findOnly({_id: fundId});
    data.team = ctx.query.team;
    ctx.template = 'interface_fund_applicationForm.pug';
    await next();
  });
module.exports = applicationRouter;
