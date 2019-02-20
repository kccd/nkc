/* 
  商铺数据表
  @author Kris 2019/2/18
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopStoresSchema = new Schema({
  // 商铺id
  id: {
    type: String,
    index: 1,
    required: true
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
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: 'shopStores'
});
const ShopStoresModel = mongoose.model('shopStores', shopStoresSchema);
module.exports = ShopStoresModel;