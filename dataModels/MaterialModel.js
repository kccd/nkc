const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  // 素材创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 素材的类型
  type: {
    type: String,
    required: true,
    enum: ['document'],
    index: 1
  },
  // 素材类型对应的 ID
  targetId: {
    type: String,
    default: false,
    index: 1
  },
  // 素材最后修改时间
  tlm: {
    type: Date,
    default: null
  },
});
module.exports = mongoose.model('materials', schema);