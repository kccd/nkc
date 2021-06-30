const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const schema = new Schema({
  target: {
    type: String,
    required: true
  },
  // 从站内哪个页面访问此链接（url）
  referer: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    default: null
  },
  // 用户点击目标链接的时间（在站内内容中点击链接的时间）
  clickAt: {
    type: Date,
    default: Date.now
  },
  // 用户访问目标链接的时间（点击继续访问的时间）
  accessAt: {
    type: Date,
    default: null
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  ip: {
    type: String,
    default: '',
    index: 1
  },
  port: {
    type: String,
    default: '',
    index: 1
  }
});

module.exports = mongoose.model('offsiteLink', schema, 'offsiteLink');