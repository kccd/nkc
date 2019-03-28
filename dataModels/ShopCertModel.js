/**
 * 商城的凭证 购买前、退款时上传
 * @author pengxiguaa 2019/3/28
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 凭证上传的人
  uid: {
    type: String,
    required:true,
    index: 1
  },
  // 订单ID
  orderId: {
    type: String,
    default: '',
    index: 1
  },
  // 资源所存路径
  path: {
    type: String,
    required: true
  },
  // 上传的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 资源格式
  ext: {
    type: String,
    required: true
  },
  // 文件名
  name: {
    type: String,
    required: true
  },
  // 文件大小
  size: {
    type: Number,
    reuqired: true
  }
}, {
  collection: "shopCerts"
});
module.exports = mongoose.model("shopCerts", schema);