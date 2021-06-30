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
  // 申请的状态 null：未处理, true: 已同意, false: 已拒绝, ignored: 忽略
  agree: {
    type: String,
    default: "null",
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

/*
* 通过好友申请ID 获取消息系统对话窗口可用的数据
* @param {Number} 好友申请ID
* */
friendsApplicationSchema.statics.getApplicationMessage = async (applicationId) => {
  const FriendsApplicationModel = mongoose.model('friendsApplications');
  const application = await FriendsApplicationModel.findOnly({_id: applicationId});
  return await application.getMessage();
};

/*
* 获取适用于消息系统的数据
* */
friendsApplicationSchema.methods.getMessage = async function() {
  const UserModel = mongoose.model('users');
  const application = this;
  const targetUser = await UserModel.findOnly({uid: application.applicantId});
  return {
    _id: application._id,
    ty: 'newFriends',
    username: targetUser.username || targetUser.uid,
    avatar: targetUser.avatar,
    description: application.description,
    uid: targetUser.uid,
    toc: application.toc,
    agree: application.agree,
    tlm: application.tlm,
    tUid: application.respondentId,
  };
}

module.exports = mongoose.model('friendsApplications', friendsApplicationSchema);
