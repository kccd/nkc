const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    _id: String,
    ip: {
      type: String,
      index: 1,
      default: '',
    },
    // 省份
    province: {
      type: String,
      default: '',
    },
    // 城市
    city: {
      type: String,
      default: '',
    },
    // 城市编码
    adCode: {
      type: String,
      default: '',
    },
    // 定位
    rectangle: {
      type: String,
      default: '',
    },
    // 更新时间
    tlm: {
      type: Date,
      default: Date.now,
      index: 1,
    },
  },
  {
    collection: 'ips',
  },
);

module.exports = mongoose.model('ips', schema);
