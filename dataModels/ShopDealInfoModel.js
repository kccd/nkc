/* 
  交易基础信息表
  @author Kris 2019/4/14
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopDealInfoSchema = new Schema({
  // 供货说明
  dealDescription: {
    type: String,
    default: ""
  },
  // 全局公告
  dealAnnouncement: {
    type: String,
    default: ""
  },
  // 用户id
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
    type: String,
    default: "",
  },
  // 运费模板
  templates: {
    type: Array,
    default: []
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
  collection: 'shopDealInfo'
});
const ShopDealInfoModel = mongoose.model('shopDealInfo', shopDealInfoSchema);
module.exports = ShopDealInfoModel;