const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const delPostLogSchema = new Schema({
  // 删除方式，删除或者退回
  delType: {
    type: String,
    default: ''
  },
  // 被删除原因
  reason: {
    type: String,
    default: ''
  },
  // 被删除帖子类型 主帖还是回帖
  postType: {
    type: String,
    default: ''
  },
  // 被删除帖子的主帖id
  threadId: {
    type: String,
    default: ''
  },
  // 被删除帖子的回帖id，如果删除的是主帖则为空
  postId: {
    type: String,
    default: ''
  },
  // 删帖是否通知 true false
  // 默认为true
  noticeType: {
    type: Boolean,
    default: true
  },
  // 是否修改过
  modifyType: {
    type: Boolean,
    default: false
  },
  // 操作删除用户id
  userId: {
    type: String,
    default: '',
    index: 1
  },
  // 被删除用户id
  delUserId: {
    type: String,
    default: '',
    index: 1
  },
  // 在主帖下回复的用户id
  postedUsers: {
    type: [String],
    default: []
  },
  // 被删除帖子的主帖标题
  delPostTitle: {
    type: String,
    default: ''
  },
  // 日志存入的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  }
});


module.exports = mongoose.model('delPostLog', delPostLogSchema);