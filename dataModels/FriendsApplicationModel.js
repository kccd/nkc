const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const friendsApplicationSchema = new Schema({

  _id: Number,
  // 申请人
  applicantId: {
    type: String,
    index: 1,
    required: true
  },
  // 被申请人
  respondentId: {
    type: String,
    index: 1,
    required: true
  },
  // 申请时间
  toc: {
    type: Date,
    index: 1,
    default: Date.now
  },
  // 处理时间
  tlm: {
    type: Date,
    index: 1,
    default: null
  },
  // 申请的状态 null：未处理, true: 已同意, false: 已拒绝
  agree: {
    type: Boolean,
    default: null,
    index: 1
  },
  // 添加好友附加的验证信息
  description: {
    type: String,
    default: ''
  }
}, {
  collection: 'friendsApplications'
});

const FriendsApplicationModel = mongoose.model('friendsApplications', friendsApplicationSchema);

module.exports = FriendsApplicationModel;