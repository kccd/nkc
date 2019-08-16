const Router = require('koa-router');
const homeRouter = require('./home');
const shelfRouter = require('./shelf');
const infoRouter = require('./info');
const decorationRouter = require('./decoration');
const classifyRouter = require('./classify');
const orderRouter = require('./order');
const goodslistRouter = require('./goodslist');
const templateRouter = require('./template');
const manageRouter = new Router();
manageRouter
  .get('/', async (ctx, next) => {
    const {data, db, params, nkcModules} = ctx;
    const {user} = data;
    if(!user) {
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, '/login'));
    }
    // 验证是否有进入卖家中心的权限
    // 暂时登陆用户默认都可以进入卖家中心
    // const store = await db.ShopStoresModel.findOne({uid: user.uid});
    // if(!store) {
    //   return ctx.redirect('/shop/openStore');
    // }else{
    //   return ctx.redirect(`/shop/manage/${store.storeId}/home`)
    // }
    data.active = "home";
    return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/shop/manage/${user.uid}/home`))
  })
  .use('/:uid', async (ctx, next) => {
    const {data, db, params, query} = ctx;
    const {uid} = params;
    const {user} = data;
    const {active} = query;
    data.active = active;
    // const myStore = await db.ShopStoresModel.findOne({storeId: account});
    if(!user || user.uid !== uid) ctx.throw(400, "这不是您的卖家中心");
    const dealInfo = await db.ShopDealInfoModel.findOne({uid: user.uid});
    data.dealInfo = dealInfo;
    // 检测是否被封禁商品上架功能
    const homeSetting = await db.ShopSettingsModel.findOne({type: "homeSetting"});
    if(homeSetting.banList) {
      if(homeSetting.banList.indexOf(user.uid) > -1) {
        data.isban = true;
      }
    }
    await next();
  })
  .get('/:uid', async (ctx, next) => {
    const {data, db, params, nkcModules} = ctx;
    const {user} = data;
    return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/shop/manage/${user.uid}/home`));
  })
  .use('/:uid/home', homeRouter.routes(), homeRouter.allowedMethods())
  .use('/:uid/shelf', shelfRouter.routes(), shelfRouter.allowedMethods())
  .use('/:uid/info', infoRouter.routes(), infoRouter.allowedMethods())
  .use('/:uid/decoration', decorationRouter.routes(), decorationRouter.allowedMethods())
  .use('/:uid/classify', classifyRouter.routes(), classifyRouter.allowedMethods())
  .use('/:uid/order', orderRouter.routes(), orderRouter.allowedMethods())
  .use('/:uid/goodslist', goodslistRouter.routes(), goodslistRouter.allowedMethods())
  .use('/:uid/template', templateRouter.routes(), templateRouter.allowedMethods())
module.exports = manageRouter;