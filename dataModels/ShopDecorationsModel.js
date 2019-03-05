/* 
  商铺装修表
  @author Kris 2019/3/4
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopDecorationsSchema = new Schema({
  // 商铺id
  storeId: {
    type: String,
    index: 1,
    required: true
  },
  // 是否有招牌背景图
  storeSignImage: {
    type: Boolean,
    default: false
  },
  // 客服工作日工作时间
  serviceTimeWork: {
    type: Array,
    default: ["0:00","0:00"]
  },
  // 客服休息日工作时间
  serviceTimeRest: {
    type: Array,
    default: ["0:00","0:00"],
  },
  // 客服联系手机号
  serviceMobile: {
    type: String,
    default: ""
  },
  // 客服固定电话号码
  servicePhone: {
    type: String,
    default: ""
  },
  // 预设关键字
  presetKey: {
    type: String,
    default: ""
  },
  // 推荐关键字
  recommendKeys: {
    type: Array,
    default: ["", "", ""]
  },
  // 左侧商品推荐
  storeLeftFeatureds:{
    type: Array,
    default: []
  },
  // // 店铺名称
  // storeName: {
  //   type: String,
  //   default: "",
  // },
  // // 店铺简介
  // storeDescription: {
  //   type: String,
  //   default: ""
  // },
  // // 店主id
  // uid: {
  //   type: String,
  //   index: true
  // }
}, {
  collection: 'shopDecorations'
});
const ShopDecorationsModel = mongoose.model('shopDecorations', shopDecorationsSchema);
module.exports = ShopDecorationsModel;