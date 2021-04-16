const Router = require('koa-router');
const orderRouter = new Router();

orderRouter
  .use('/', async (ctx, next) => {
    const {data} = ctx;
    data.navType = "manageOrder";
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page = 0, t} = query;
    const {user} = data;
    // 构造查询条件
    const searchMap = {
      sellUid : user.uid
    };

    data.counter = {
      unCost: await db.ShopOrdersModel.countDocuments({sellUid: user.uid, closeStatus: false, orderStatus: "unCost"}),
      unShip: await db.ShopOrdersModel.countDocuments({sellUid: user.uid, closeStatus: false, orderStatus: "unShip"}),
      unSign: await db.ShopOrdersModel.countDocuments({sellUid: user.uid, closeStatus: false, orderStatus: "unSign"}),
      refunding: await db.ShopOrdersModel.countDocuments({sellUid: user.uid, closeStatus: false, refundStatus: "ing"})
    };    

    if(t === "refunding") {
      searchMap.refundStatus = "ing";
    } else if(t === "close") {
      searchMap.closeStatus = true;
    } else if(t && t !== "all") {
      searchMap.closeStatus = false;
      searchMap.orderStatus = t;
    }

    const count = await db.ShopOrdersModel.countDocuments(searchMap);
    const paging = nkcModules.apiFunction.paging(page, count);
    const orders = await db.ShopOrdersModel.find(searchMap).sort({orderToc: -1}).skip(paging.start).limit(paging.perpage);
    data.orders = await db.ShopOrdersModel.storeExtendOrdersInfo(orders);
    data.orders = await db.ShopOrdersModel.translateOrderStatus(data.orders);
    data.t = t;
    data.paging = paging;
    ctx.template = 'shop/manage/order/order.pug';
    await next();
  });
module.exports = orderRouter;