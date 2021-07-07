const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  // 被看人 UID
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 操作人 UID
  mUid: {
    type: String,
    default: '',
    index: 1
  },
  // 操作时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 用户的状态码
  code: {
    type: [String],
    default: []
  },
  // 操作者待验证的验证码
  mCode: {
    type: String,
    required: true,
    index: 1
  },
  // 验证码是否有效
  status: {
    type: Boolean,
    default: null,
  },
  // 操作人 IP
  ip: {
    type: String,
    default: ''
  },
  // 操作人 PORT
  port: {
    type: String,
    default: ''
  }
}, {
  collection: 'usersCodeLogs'
});

module.exports = mongoose.model('usersCodeLogs', schema);