const Router = require('koa-router');
const fundRouter = new Router();
const applicationRouter = require('./application');
const {certificates} = require('../../settings').permission;
fundRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {add, management, list} = ctx.query;
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
    const queryOfApplying = db.FundApplicationFormModel.match({
      pStatus: {$ne: 0},
      uStatus: {$ne: 0},
      usersSupport: {$ne: false},
      projectPassed: {$ne: false},
      usersMessagesPassed: {$ne: false},
      adminSupport: {$ne: false},
      remittance: null
    });
    const queryOfBeingFunded = db.FundApplicationFormModel.match({
      remittance: true,
      complete: null
    });
    const queryOfExcellent = db.FundApplicationFormModel.match({
      excellent: true
    });

    const applications = {};
    applications.applying = await db.FundApplicationFormModel.find(queryOfApplying);
    applications.beingFunded = await db.FundApplicationFormModel.find(queryOfBeingFunded);
    applications.excellent = await db.FundApplicationFormModel.find(queryOfExcellent);
    data.applications = applications;

    data.fundList = await db.FundModel.find({display: true}).sort({toc: 1});
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
  .post('/:fundId', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {applicationForm} = ctx.body;
    const {fundId} = ctx.params;
    const fund = await db.FundModel.findOnly({_id: fundId, display: true});
    applicationForm.uid = user.uid;
    applicationForm.fundId = fund._id;
    const newApplicationForm = db.FundApplicationFormModel(applicationForm);
    await newApplicationForm.save();
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
  .get('/:fundId/list', async (ctx, next) => {

  })
  .use('/:fundId/application', applicationRouter.routes(), applicationRouter.allowedMethods());
module.exports = fundRouter;