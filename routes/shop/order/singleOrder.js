const Router = require('koa-router');
const router = new Router();
const refundRouter = require('./refund');
router
  .use('/', async (ctx, next) => {
    const {data, params, db} = ctx;
    data.order = await db.ShopOrdersModel.findOne({orderId: params.orderId});
    if(!data.order) ctx.throw(400, `订单【${params.orderId}】不存在, 请刷新`);
    if(data.order.uid !== data.user.uid) ctx.throw(403, '您无权操作别人的订单')
    await next();
  })
  // 查看物流
  .get('/logistics', async(ctx, next) => {
    const {data, db, params, body, nkcModules} = ctx;
    const {user} = data;
    const {orderId} = params;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, "未找到该订单");
    if(user.uid !== order.uid) ctx.throw(400, "您无权查看该订单的物流信息");
    if(!order.trackNumber) ctx.throw(400, "暂无物流信息");
    let trackNumber = order.trackNumber;
    const trackInfo = await nkcModules.apiFunction.getTrackInfo("3399564142457");
    data.trackNumber = trackNumber;
    data.trackInfo = trackInfo;
    ctx.template = "/shop/order/logistics.pug";
    await next();
  })
  // 确认收货
  .patch('/receipt', async(ctx, next) => {
    const {data, db, params, body} = ctx;
    const {user} = data;
    const {orderId} = params;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(!order) ctx.throw(400, "未找到订单");
    if(user.uid !== order.uid) ctx.throw(400, "您无权操作此订单");
    let time = new Date();
    await order.update({$set:{"orderStatus":"finish", "signToc":time}})
    await next();
  })
  // 查看订单详情
  .get('/detail', async (ctx, next) => {
    const {data, db, params, query, nkcModules} = ctx;
    const {orderId} = params;
    const {user} = data;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(user.uid !== order.uid) ctx.throw(403, "您无权查看此订单");
    if(!order) ctx.throw(400, "订单不存在");
    let orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    data.order = orders[0];
    ctx.template = '/shop/order/detail.pug';
    await next();
  })
  .use('/refund', refundRouter.routes(), refundRouter.allowedMethods());
module.exports = router;