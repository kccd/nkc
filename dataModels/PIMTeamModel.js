const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  // 团队 ID
  _id: Number,
  // 团队创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 团队创始人
  uid: {
    type: String,
    default: '',
    index: 1
  },
  // 团队名称
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 团队名称 小写
  nameLowerCase: {
    type: String,
    required: true,
    index: 1
  },
  // 团队介绍
  description: {
    type: String,
    default: ''
  },

}, {
  collection: 'PIMTeams'
});

module.exports = mongoose.model('PIMTeams', schema);