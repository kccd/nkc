const Router = require('koa-router');
const applicationRouter = new Router();
applicationRouter
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    const {fundId} = ctx.params;
    data.fund = await db.FundModel.findOnly({_id: fundId});
    data.team = ctx.query.team;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    const {photos} = userPersonal.privateInformation;
    data.photos = photos;
    ctx.template = 'interface_fund_applicationForm.pug';
    await next();
  })
  .post('/:applicationFormId', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {updateObj} = ctx.body;
    const {applicationFormId} = ctx.params;
    const applicationForm = await db.FundApplicationFormModel.findOnly({_id: applicationFormId, uid: user.uid});
    await applicationForm.update(updateObj);
    await next();
  });
module.exports = applicationRouter;
