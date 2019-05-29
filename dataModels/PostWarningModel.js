const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 内容的发送者
  tUid: {
    type: String,
    required: true,
    index: 1
  },
  // 建议的类型
  type: {
    type: String, // warningPost, warningThread
    required: true,
    index: 1
  },
  // 处理人ID
  handlerId: {
    type: String,
    default: "",
    index: 1
  },
  // 发送修改建议的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tid: {
    type: String,
    required: true,
    index: 1
  },
  pid: {
    type: String,
    required: true,
    index: 1
  },
  reason: {
    type: String,
    required: true
  },
  // 建议内容的最后修改人ID
  modifierId: {
    type: String,
    default: ""
  },
  // 建议内容的最后修改时间
  modifiedTime: {
    type: Date,
    default: null
  }
}, {
  collection: "postWarnings"
});
module.exports = mongoose.model("postWarnings", schema);