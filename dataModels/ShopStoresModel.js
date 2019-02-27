/* 
  商铺数据表
  @author Kris 2019/2/18
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopStoresSchema = new Schema({
  // 商铺id
  storeId: {
    type: String,
    index: 1,
    required: true
  },
  // 店铺名称
  storeName: {
    type: String,
    default: "",
  },
  // 店铺简介
  storeDescription: {
    type: String,
    default: ""
  },
  // 店主id
  uid: {
    type: String,
    index: true
  },
  // 手机号码
  mobile: {
    type: [String],
    default: [],
  },
  // 地址
  address: {
    type: [String],
    default: [],
  },
  // 商品种类数
  productsCounts: {
    type: Number,
    default: 0
  },
  // 开店时间
  startBusinessToc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 关店时间
  stopBusinessToc: {
    type: Date
  },
  /**
   * 店铺资料是否完善
   * @如果店铺资料未完善，必须先完善店铺资料
   */
  dataPerfect: {
    type: Boolean,
    default: false
  }
}, {
  collection: 'shopStores'
});
const ShopStoresModel = mongoose.model('shopStores', shopStoresSchema);
module.exports = ShopStoresModel;