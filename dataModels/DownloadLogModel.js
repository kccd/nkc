const settings = require('../settings');
const mongoose = settings.database;
const schema = new mongoose.Schema({
  // 用户ID，游客为""
  uid: {
    type: String,
    default: "",
    index: 1
  },
  ip: {
    type: String,
    default: "",
    index: 1
  },
  port: {
    type: String,
    default: ""
  },
  // 对应的附件ID
  rid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: "downloadLogs"
});

module.exports = mongoose.model("downloadLogs", schema);