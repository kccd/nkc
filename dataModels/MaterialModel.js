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
    enum: ['document', 'resource', 'folder'],
    index: 1
  },
  // 素材名称
  // resource 素材默认名称为文件名
  // document 素材名称默认为 document title 或 content 的截取
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 上级素材 ID，主要是文件夹 ID
  mid: {
    type: String,
    default: '',
    index: 1
  },
  // 素材类型对应的 ID
  targetId: {
    type: String,
    default: '',
    index: 1
  },
  // 素材最后修改时间
  tlm: {
    type: Date,
    default: null
  },
});
module.exports = mongoose.model('materials', schema);