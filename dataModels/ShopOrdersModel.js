/* 
  商品订单表
  @author Kris 2019/2/22
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopOrdersSchema = new Schema({
  // 订单id
  orderId: {
    type: String,
    index: 1,
    required: true
  },
  // 商铺id
  storeId: {
    type: String,
    index: 1
  },
  // 商品id
  productId: {
    type: String,
    index: 1
  },
  // 规格id
  paramId: {
    type: String,
    index: 1
  },
  // 购买者uid
  uid: {
    type: String,
  },
  // 数量
  count: {
    type: Number,
    default: 1
  },
  // 订单原始总价
  orderOriginPrice: {
    type: Number
  },
  // 订单最终总价格
  orderPrice: {
    type: Number,
  },
  // 收货地址
  receiveAddress: {
    type: String,
    default: ""
  },
  // 收货人姓名
  receiveName: {
    type: String,
    default: ""
  },
  // 收货人电话
  receiveTel: {
    type: String,
    default: ""
  },
  // 下单时间
  orderToc: {
    type: Date,
    default: Date.now
  },
  // 是否完成付款
  payAlready: {
    type: Boolean,
  },
  // 付款时间
  payToc: {
    type: Date
  },
  /**
   * 订单状态
   * @待付款 unCost
   * @待发货 unShip
   * @待收货 unSign
   * @订单完成 finish
   */
  orderStatus: {
    type: String,
    default: "unCost"
  },
  // 是否有退款
  idRefund: {
    type: Boolean,
    default: false
  },
  /**
   * 退款状态
   * @ing 正在退款中
   * @end 退款已处理
   */
  refundStatus: {
    type: String,
    default: ""
  },
}, {
  collection: 'shopOrders'
});
const ShopOrdersModel = mongoose.model('shopOrders', shopOrdersSchema);
module.exports = ShopOrdersModel;