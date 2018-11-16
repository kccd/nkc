const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const xsfsRecordSchema = new Schema({
  _id: Number,
  // 学术分变化的人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 执行操作的人
  operatorId: {
    type: String,
    required: true,
    index: 1
  },
  num: {
    type: Number,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  description: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    required: true,
    index: 1
  },
  port: {
    type: String,
    required: true
  },
  pid: {
    type: String,
    required: true,
    index: 1
  },
  canceled: {
    type: Boolean,
    default: false,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  lmOperatorId: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    default: ''
  }
}, {
  collection: 'xsfsRecords'
});
module.exports = mongoose.model('xsfsRecords', xsfsRecordSchema);