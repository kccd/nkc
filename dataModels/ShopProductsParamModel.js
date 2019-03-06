/* 
  商品规格
  @author pengxiguaa 2019/2/5
*/
'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  // 规格ID
  _id: Number,
  // 商品ID
  productId: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 规格索引 对应着商品中的规格值索引，如：0-1-2、2-1-3
  index: {
    type: String,
    default: '',
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 当前规格总库存量
  stocksTotal: {
    type: Number,
    required: true
  },
  // 当前规格剩余库存量
  stocksSurplus: {
    type: Number,
    required: true
  },
  /**
   * 付款方式
   * @kcb 只用科创币支付
   * @rmb 只用人民币支付
   * @kar 科创币与人民币混合付款
   */
  payMethod: {
    type: String,
    default: "kcb"
  },
  originPrice: {
    type: Number,
    required: true
  },
  // 商品价格 折扣前
  price: {
    type: Number,
    required: true
  },
  // 是否使用折扣
  useDiscount: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: 'shopProductsParams'
});
const ShopProductParamMode = mongoose.model('shopProductsParams', schema);
module.exports = ShopProductParamMode;