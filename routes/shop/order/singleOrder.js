const Router = require('koa-router');
const router = new Router();
const refundRouter = require('./refund');
router
  .use('/', async (ctx, next) => {
    const {data, params, db} = ctx;
    data.order = await db.ShopOrdersModel.findOne({orderId: params.orderId});
    if(!data.order) ctx.throw(400, `订单【${params.orderId}】不存在, 请刷新`);
    if(data.order.buyUid !== data.user.uid) ctx.throw(403, '您无权操作别人的订单')
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
    if(user.uid !== order.buyUid) ctx.throw(400, "您无权查看该订单的物流信息");
    if(!order.trackNumber) ctx.throw(400, "暂无物流信息");
    let trackNumber = order.trackNumber;
    let trackName = order.trackName;
    if(trackName == "SFEXPRESS" && order.receiveMobile) {
			trackNumber = trackNumber + ":" + order.receiveMobile.substring(order.receiveMobile.length -2,order.receiveMobile.length)
		}
    const trackInfo = await nkcModules.apiFunction.getTrackInfo(trackNumber, trackName);
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
    const order = await db.ShopOrdersModel.findById(orderId);
    if(user.uid !== order.buyUid) ctx.throw(400, "您无权操作此订单");
    await order.confirmReceipt();
    await next();
  })
  // 查看订单详情
  .get('/detail', async (ctx, next) => {
    const {data, db, params, query, nkcModules} = ctx;
    const {orderId} = params;
    const {user} = data;
    if(!orderId) ctx.throw(400, "订单号有误");
    const order = await db.ShopOrdersModel.findOne({orderId});
    if(user.uid !== order.buyUid) ctx.throw(403, "您无权查看此订单");
    if(!order) ctx.throw(400, "订单不存在");
    let orders = await db.ShopOrdersModel.userExtendOrdersInfo([order]);
    data.order = orders[0];
		// 获取订单凭证
		const certs = await db.ShopCertModel.find({orderId});
    data.certs = certs;
    // 获取订单关闭原因
    const refund = await db.ShopRefundModel.findOne({orderId}).sort({_id:-1}).limit(1);
    if(refund) {
      refund.description = ctx.state.lang("shopRefundStatus", refund.status) || refund.status;
    }
    data.refund = refund;
    ctx.template = '/shop/order/detail.pug';
    await next();
  })
  .use('/refund', refundRouter.routes(), refundRouter.allowedMethods());
module.exports = router;