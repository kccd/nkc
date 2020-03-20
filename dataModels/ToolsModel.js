const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const toolsSchema = new Schema({
  // 工具id
  _id: {
    type: Number,
    required: true
  },
  // 工具名字
  name: {
    type: String,
    required: true
  },
  // 作者uid(如果有的话)
  uid: String,
  // 作者的名字(如果有的话)
  author: String,
  // 版本号
  version: {
    type: String,
    default: "1.0.0"
  },
  // 简介(如果有的话)
  summary: String,
  // 最后修改日期
  lastModify: {
    type: Date,
    default: Date.now
  },
  // 入口文件名
  entry: {
    type: String,
    default: "/index.html"
  },
  // 是否是站外链接
  isOtherSite: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('tools', toolsSchema);
