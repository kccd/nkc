/* 
  商品数据表
  @author Kris 2019/2/18
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopGoodsSchema = new Schema({
  // 商品id
  productId: {
    type: String,
    index: 1,
    required: true
  },
  // 用户id
  uid: {
    type: String,
    index: 1
  },
  // 商品名称
  productName: {
    type: String,
    retuire: true
  },
  // 商品简单介绍
  productDescription: {
    type: String
  },
  // 商品详情介绍
  productDetails: {
    type: String
  },
  // // 自定义商品参数(不参与搜索)
  // productParams: {
  //   type
  // }
  // 商品介绍图
  imgIntroductions:{
    type: Array,
    default: [String]
  },
  // 商品主图
  imgMaster: {
    type: String,
  },
  // 商铺id
  storeId: {
    type: String,
    required: true
  },
  // 库存总数量
  stockTotalCount: {
    type: Number,
    default: 0
  },
  // 库存剩余数量
  stockSurplusCount: {
    type: Number,
    default: 0
  },
  /**
   * 库存计数方式
   * @payReduceStock 付款减库存
   * @orderReduceStock 下单减库存
   */
  stockCostMethod: {
    type: String,
    default: "payReduceStock"
  },
  // 总评价数量
  evalTotalCount: {
    type: Number,
    default: 0
  },
  /**
   * 付款方式
   * @kcb 只用科创币支付
   * @rmb 只用人民币支付
   * @kar 科创币与人民币混合付款
   */
  productPayMethod: {
    type: String,
    default: "kcb"
  },
  // 商品原始价格
  productOriginalPrice: {
    type: Number,
  },
  // 是否使用折扣
  useRebate: {
    type: Boolean
  },
  // 商品最终价格(在使用折扣、优惠等方式后的价格)
  productFinalPrice: {
    type: Number,
  },
  // 商品KCB价格
  priceKCB: {
    type: Number,
    default: 0
  },
  // 商品RMB价格
  priceRMB: {
    type: Number,
    default: 0
  },
  // 上架时间
  shelfToc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 下架时间
  removalToc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  /**
   * 商品状态
   * @notnoshelf 未上架
   * @offshelf 已下架
   * @insale 销售中
   * @soldout 已售空
   */
  productStatus: {
    type: String,
    default: "notonshelf"
  }
}, {
  collection: 'shopGoods'
});
const ShopGoodsModel = mongoose.model('shopGoods', shopGoodsSchema);
module.exports = ShopGoodsModel;