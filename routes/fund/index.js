const Router = require('koa-router');
const fundRouter = new Router();
const applicationRouter = require('./application');
const {certificates} = require('../../settings').permission;
fundRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {add, management} = ctx.query;
    if(add === 'true') {
      const fundCerts = [];
      for (let cert in certificates) {
        fundCerts.push({
          cert: cert,
          displayName: certificates[cert].displayName
        });
      }
      data.fundCerts = fundCerts;
      ctx.template = 'interface_fund_setting.pug';
      return await next();
    }
    if(management === 'true') {
      data.fundList = await db.FundModel.find({}).sort({toc: 1});
      ctx.template = 'interface_fund_management.pug';
      return await next();
    }
    data.fundList = await db.FundModel.find({}).sort({toc: 1});
    ctx.template = 'interface_fund.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {fundObj} = ctx.body;
    fundObj.name = fundObj.name || '科创基金';
    fundObj._id = await db.SettingModel.operateSystemID('funds', 1);
    const newFund = db.FundModel(fundObj);
    await newFund.save();
    await next();
  })
  .del('/:fundId', async (ctx, next) => {
    const {data, db} = ctx;
    const {fundId} = ctx.params;
    const fund = await db.FundModel.findOnly({_id: fundId});
    await fund.remove();
    await next();
  })
  .patch('/:fundId', async (ctx, next) => {
    const {data, db} = ctx;
    const {fundId} = ctx.params;
    const {fundObj} = ctx.body;
    const fund = await db.FundModel.findOnly({_id: fundId});
    await fund.update(fundObj);
    await next();
  })
  .get('/:fundId/settings', async (ctx, next) => {
    const {data, db} = ctx;
    const {fundId} = ctx.params;
    const fundCerts = [];
    for (let cert in certificates) {
      fundCerts.push({
        cert: cert,
        displayName: certificates[cert].displayName
      });
    }
    data.fundCerts = fundCerts;
    data.fund = await db.FundModel.findOnly({_id: fundId});
    ctx.template = 'interface_fund_setting.pug';
    await next();
  })
  .use('/:fundId/application', applicationRouter.routes(), applicationRouter.allowedMethods());
module.exports = fundRouter;