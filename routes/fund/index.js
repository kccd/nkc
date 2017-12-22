const Router = require('koa-router');
const fundRouter = new Router();
fundRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.fundList = await db.FundModel.find({}).sort({toc: 1});
    ctx.template = 'interface_fund.pug';
    await next();
  })
  .get('/management', async (ctx, next) => {
    const {data, db} = ctx;
    data.fundList = await db.FundModel.find({}).sort({toc: 1});
    ctx.template = 'interface_fund_management.pug';
    await next();
  })
  .get('/management/:fundId', async (ctx, next) => {
    const {data, db} = ctx;
    const {fundId} = ctx.params;
    data.fundCerts = [{cert: 'mobile', displayName: '机友'}, {cert: 'email', displayName: '笔友'}, {cert: 'dev', displayName: '运维'}, {cert: 'fund', displayName: '基金审查员'}];
    data.fund = await db.FundModel.findOnly({_id: fundId});
    ctx.template = 'interface_fund_setting.pug';
    await next();
  })
  .del('/management/:fundId', async (ctx, next) => {
    const {data, db} = ctx;
    const {fundId} = ctx.params;
    const fund = await db.FundModel.findOnly({_id: fundId});
    await fund.remove();
    await next();
  })
  .patch('/management/:fundId', async (ctx, next) => {
    const {data, db} = ctx;
    const {fundId} = ctx.params;
    const {fundObj} = ctx.body;
    const fund = await db.FundModel.findOnly({_id: fundId});
    await fund.update(fundObj);
    await next();
  })
  .get('/add', async (ctx, next) => {
    const {data, db} = ctx;
    data.fundCerts = [{cert: 'mobile', displayName: '机友'}, {cert: 'email', displayName: '笔友'}, {cert: 'dev', displayName: '运维'}, {cert: 'fund', displayName: '基金审查员'}];
    ctx.template = 'interface_fund_setting.pug';
    await next();
  })
  .post('/add', async (ctx, next) => {
    const {data, db} = ctx;
    const {fundObj} = ctx.body;
    fundObj.name = fundObj.name || '科创基金';
    fundObj._id = await db.SettingModel.operateSystemID('funds', 1);
    const newFund = db.FundModel(fundObj);
    await newFund.save();
    console.log(fundObj);
    await next();
  });
module.exports = fundRouter;