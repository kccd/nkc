const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  //创建人uid
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
  //分类名称
  name: {
    type: String,
    required: true,
    index: 1
  },
  description: {
    type: String,
    default: '',
  },
  // 素材最后修改时间
  tlm: {
    type: Date,
    default: null
  },
}, {
  toObject: {
    getters: true,
    virtuals: true
  }
});

module.exports = mongoose.model('resourceCategory', schema);
