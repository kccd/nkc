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
    default: []
  },
  // 首页精选
  featureds: {
    type: Schema.Types.Mixed,
    default: []
  },
  // 店铺推荐
  recommendations: {
    type: Schema.Types.Mixed,
    default: []
  },
  // 最热商品
  populars: {
    type: Schema.Types.Mixed,
    default: []
  },
  // 权限申请身份等级
  authLevel: {
    type: Number,
    default: 1
  },
  // 封禁名单
  banList: {
    type: Array,
    default:[]
  }
}, {
  collection: 'shopSettings'
});
const ShopSettingsModel = mongoose.model('shopSettings', shopSettingsSchema);
module.exports = ShopSettingsModel;