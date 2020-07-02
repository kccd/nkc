const mongoose = require("../settings/database");
const schema = new mongoose.Schema({
  _id: Number,
  type: {
    type: String,
    required: true,
    index: 1
  },
  count: {
    type: Number,
    default: 3,
  },
  cycle: {
    type: String,
    default: 'day',
    index: 1,
  },
  score1: {
    type: Number,
    default: 0,
  },
  score2: {
    type: Number,
    default: 0,
  },
  score3: {
    type: Number,
    default: 0,
  },
  score4: {
    type: Number,
    default: 0,
  },
  score5: {
    type: Number,
    default: 0,
  },
  score6: {
    type: Number,
    default: 0,
  },
  score7: {
    type: Number,
    default: 0,
  },
  forumAvailable: {
    type: Boolean, // 专业可用
    required: true,
    index: 1,
  },
  from: {
    type: String,
    default: 'default', // default: 后台积分策略, forum: 专业积分策略
    index: 1,
  },
  fid: {
    type: String,
    default: '',
    index: 1
  }
}, {
  collection: 'scoreOperations'
});

module.exports = mongoose.model('scoreOperations', schema);
