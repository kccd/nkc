/* 
  商品设置表
  @author Kris 2019/2/28
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopSettingsSchema = new Schema({
  // 设置类型
  type: {
    type: String,
    index: 1
  },
  // 轮播图
  carousels: {
    type: Schema.Types.Mixed,
  },
  // 首页精选
  featureds: {
    type: Schema.Types.Mixed
  }
}, {
  collection: 'shopSettings'
});
const ShopSettingsModel = mongoose.model('shopSettings', shopSettingsSchema);
module.exports = ShopSettingsModel;