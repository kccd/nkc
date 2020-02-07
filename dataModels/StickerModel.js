/*
* 表情相关
* 两种类型的数据。1、表情；2、表情包；
* */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  // 表情ID或表情包ID
  _id: Number,
  // 创建者ID
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 对应附件的ID
  rid: {
    type: String,
    required: true,
    index: 1
  },
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 表情包ID，表示单一表情时为null
  parentId: {
    type: Number,
    default: null,
    index: 1
  },
  // 表情包名称 全表唯一
  name: {
    type: String,
    default: "",
    index: 1
  },
  // 表情包介绍
  description: {
    type: String,
    default: ""
  },
  // 表情包封面 表情ID
  coverId: {
    type: Number,
    default: null
  }
}, {
  collection: "stickers"
});

module.exports = mongoose.model("stickers", schema);