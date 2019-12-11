const Router = require('koa-router');
const homeRouter = require('./home');
const infoRouter = require('./info');
const decorationRouter = require('./decoration');
const classifyRouter = require('./classify');
const orderOldRouter = require('./orderOld');
const goodsListRouter = require('./goodsList');
const templateRouter = require('./template');

// 订单管理
const orderRouter = require('./order');
// 交易设置
const settingsRouter = require("./settings");
// 商品管理
const goodsRouter = require("./goods");
// 上架商品
const shelfRouter = require('./shelf');

const manageRouter = new Router();
manageRouter
  .get('/', async (ctx, next) => {
    const {data, db, params, nkcModules} = ctx;
    const {user} = data;
    if(!user) {
      return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, '/login'));
    }
    data.active = "home";
    return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/shop/manage/${user.uid}/home`))
  })
  .use("/", async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const {active} = query;
    data.active = active;
    if(!user) ctx.throw(400, "你先登录");
    data.dealInfo = await db.ShopDealInfoModel.findOne({uid: user.uid});
    // 检测是否被封禁商品上架功能
    const homeSetting = await db.ShopSettingsModel.findOne({type: "homeSetting"});
    if(homeSetting.banList) {
      if(homeSetting.banList.indexOf(user.uid) > -1) {
        data.isban = true;
      }
    }
    await next();
  })
  
  .use(["/order", "/goods", "/shelf"], async (ctx, next) => {
    if(!ctx.data.dealInfo) return ctx.redirect(ctx.nkcModules.apiFunction.generateAppLink(ctx.state, `/shop/manage/settings`));
    await next();
  })
  
  .use("/order", orderRouter.routes(), orderRouter.allowedMethods())
  
  
  .use("/settings", settingsRouter.routes(), settingsRouter.allowedMethods())
  .use("/goods", goodsRouter.routes(), goodsRouter.allowedMethods())
  .use("/shelf", shelfRouter.routes(), shelfRouter.allowedMethods())
  // .use("/:uid/shelf", shelfRouter.routes(), shelfRouter.allowedMethods())

  .use('/:uid/home', homeRouter.routes(), homeRouter.allowedMethods())
  .use('/:uid/info', infoRouter.routes(), infoRouter.allowedMethods())
  .use('/:uid/decoration', decorationRouter.routes(), decorationRouter.allowedMethods())
  .use('/:uid/classify', classifyRouter.routes(), classifyRouter.allowedMethods())
  .use('/:uid/order', orderOldRouter.routes(), orderOldRouter.allowedMethods())
  .use('/:uid/goodslist', goodsListRouter.routes(), goodsListRouter.allowedMethods())
  .use('/:uid/template', templateRouter.routes(), templateRouter.allowedMethods())
module.exports = manageRouter;