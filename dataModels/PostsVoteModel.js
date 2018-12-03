const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postsVoteSchema = new Schema({
  uid: {
    type: String,
    index: 1,
    required: true
  },
  toc: {
    type: Date,
    index: 1,
    default: Date.now
  },
  tlm: {
    type: Date,
    index: 1,
    default: Date.now
  },
  pid: {
    type: String,
    index: 1,
    required: true
  },
  tUid: {
    type: String,
    index: 1,
    required: true
  },
  type: {
    type: String, // up, down
    index: 1,
    required: true,
  },
  // 权重 普通用户：1， 学者：2，  专家：5
  num: {
    type: Number,
    default: 1
  }
}, {
  collection: 'postsVotes'
});
module.exports = mongoose.model('postsVotes', postsVoteSchema);