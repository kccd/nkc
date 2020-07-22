const Router = require('koa-router');
const templateRouter = new Router();
templateRouter
  .use('/', async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    const {user} = data;
    const dealInfo = await db.ShopDealInfoModel.findOne({uid: user.uid});
    if(!data.dealInfo || !data.dealInfo.dataPerfect) {
      return ctx.redirect(`/shop/manage/${user.uid}/info`)
    }
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {user} = data;
    const dealInfo = await db.ShopDealInfoModel.findOne({uid: user.uid});
    data.templates = dealInfo?dealInfo.templates:[]
    ctx.template = 'shop/manage/template.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {data, db, query, body} = ctx;
    const {user} = data;
    const {templates} = body;
    const dealInfo = await db.ShopDealInfoModel.findOne({uid: user.uid});
    await dealInfo.update({$set:{templates}})
    await next();
  })
module.exports = templateRouter;
