const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  type: {
    type: String,
    required: true,
    index: 1,
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  ip: {
    type: String,
    default: '',
    index: 1,
  },
  port: {
    type: String,
    default: '',
    index: 1
  },
  // 与之相关的积分记录ID
  recordsId: {
    type: [String],
    default: [],
    index: 1
  }
}, {
  collection: 'scoreOperationLogs'
});
module.exports = mongoose.model('scoreOperationLogs', schema);
