/* 
  开店申请表
  @author Kris 2019/2/25
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopApplyStoreSchema = new Schema({
  // 用户id
  uid: {
    type: String,
    index: 1
  },
  // 用户名称
  username: {
    type: String,
    index: 1
  },
  /**
   * 申请状态
   * @dealing 处理中
   * @approve 批准
   * @reject 驳回
   */
  applyStatus: {
    type: String,
    default: "dealing"
  },
  // 申请处理人
  dealUid: {
    type: String
  },
  // 驳回原因
  rejection: {
    type: String
  },
  // 提交申请时间
  submitApplyToc: {
    type: Date,
    default: Date.now
  },
  // 处理申请时间
  dealApplyToc: {
    type: Date
  }
}, {
  collection: 'shopApplyStore'
});
const ShopApplyStoreModel = mongoose.model('shopApplyStore', shopApplyStoreSchema);
module.exports = ShopApplyStoreModel;