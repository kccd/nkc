/* 
  商品购买表
  @author Kris 2019/4/17
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopCostRecordSchema = new Schema({
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 购买记录id
  costId: {
    type: String,
    index: 1,
    required: true
  },
  // 订单Id
  orderId: {
    type: String,
    index: 1,
    required: true
  },
  // 商品Id
  productId: {
    type: String,
    index: 1,
    required: true
  },
  // 规格Id
  productParamId: {
    type: Number,
    index: 1,
    required: true
  },
  // 购买数量
  count: {
    type: Number 
  },
  // 购买者id
  uid: {
    type: String
  },
  // 运费
  freightPrice: {
    type: Number
  },
  // 商品单价
  productPrice: {
    type: Number
  },
  // 退款状态
  refundStatus: {
    type: String,
    default: ""
  }
}, {
  collection: 'shopCostRecord'
});

const ShopCostRecordModel = mongoose.model('shopCostRecord', shopCostRecordSchema);
module.exports = ShopCostRecordModel;