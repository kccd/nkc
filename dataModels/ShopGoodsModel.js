/* 
  商品数据表
  @author Kris 2019/2/18
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopGoodsSchema = new Schema({
  // 商品id
  id: {
    type: String,
    index: 1,
    required: true
  },
  // 商品名称
  productName: {
    type: String,
    retuire: true
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
  // 库存数量
  stockCount: {
    type: Number,
    default: 0
  },
  // 总评价数量
  evalTotalCount: {
    type: Number,
    default: 0
  },
  // 商品KCB价格
  priceKCB: {
    type: Number,
    default: 0
  },
  // 商品RMB价格
  priceKCB: {
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
  }
}, {
  collection: 'shopGoods'
});
const ShopGoodsModel = mongoose.model('shopGoods', shopGoodsSchema);
module.exports = ShopGoodsModel;