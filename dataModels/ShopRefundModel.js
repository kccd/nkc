const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 买家ID
  buyerId: {
    type: String,
    required: true,
    index: 1
  },
  // 商品ID
  productId: {
    type: String,
    required: true,
    index: 1
  },
  // 商品规格ID
  productParamId: {
    type: String,
    required: true,
    index: 1
  },
  // 订单ID
  orderId: {
    type: String,
    required: true,
    index: 1
  },
  // 卖家ID
  sellerId: {
    type: String,
    required: true,
    index: 1
  },
  // 申请退款的理由
  reason: {
    type: String,
    required: true
  },
  // 拒绝退款的理由
  refuseReason: {
    type: String,
    default: ''
  },
  // 是否同意退款，true: 同意, false: 不同意, null: 未处理
  agree: {
    type: Boolean,
    default: null,
    index: 1
  },
  // 买家申请的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 卖家处理的时间
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  // 是否需要退款
  refundMoney: {
    type: Boolean,
    default: true
  },
  // 是否需要退货
  refundProduct: {
    type: Boolean,
    default: true
  }
}, {
  collection: 'shopRefunds'
});

module.exports = mongoose.model('shopRefunds', schema);