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
   * @已发货 shipped
   * @未发货 unshipped
   * @已签收 received
   * @订单完成 completed
   */
  orderStatus: {
    type: String
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
    type: String
  },
  // 商品种类数
  productsCounts: {
    type: Number,
    default: 0
  }
}, {
  collection: 'shopOrders'
});
const ShopOrdersModel = mongoose.model('shopOrders', shopOrdersSchema);
module.exports = ShopOrdersModel;