const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  name: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  cover: {
    type: String,
    default: ''
  },
  // 目录列表
  // 命名规则：type:id
  // postId: post:pid
  // articleId：article:aid
  list: {
    type: [String],
    default: []
  }
}, {
  collection: 'books'
});

module.exports = mongoose.model('books', schema);