const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({

  _id: Number,

  uid: {
    type: String,
    index: 1,
    required: true
  },
  tUid: {
    type: String,
    index: 1,
    required: true
  },
  // last message id
  lmId: {
    type: Number,
    default: null
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
  total: {
    type: Number,
    default: 0
  },
  unread: {
    type: Number,
    default: 0
  }
}, {
  collection: 'createdChat'
});

chatSchema.pre('save', function(next) {
  if(!this.tlm) this.tlm = this.toc;
  next();
});

/* 
  更新或创建‘已创建的聊天’中的记录
  若记录已存在则更新记录，若记录不存在则创建记录
  @param uid 当前用户ID
  @param targetUid 对方用户ID
  @author pengxiguaa 2019/2/12
*/
chatSchema.statics.createChat = async (uid, targetUid, both) => {
  const CreatedChatModel = mongoose.model('createdChat');
  const MessageModel = mongoose.model('messages');
  const SettingModel = mongoose.model('settings');
  let chat = await CreatedChatModel.findOne({uid: uid, tUid: targetUid});
  // 获取用户间的最新一条信息（可能不存在）
  let message = await MessageModel.findOne({ty: 'UTU', $or: [{s: uid, r: targetUid}, {s: targetUid, r: uid}]}).sort({tc: -1});
  // 获取用户间的信息总数
  const total = await MessageModel.countDocuments({ty: 'UTU', $or: [{s: uid, r: targetUid}, {r: uid, s: targetUid}]});
  // 没有发过信息
  if(!message) {
    message = {
      tc: Date.now(),
      _id: null
    }
  }
  // 不存在聊天
  if(!chat) {
    chat = CreatedChatModel({
      _id: await SettingModel.operateSystemID('createdChat', 1),
      uid: uid,
      tUid: targetUid,
      lmId: message._id
    });
    await chat.save();
  }
  // 更新聊天
  await chat.updateOne({
    tlm: message.tc,
    lmId: message._id,
    total,
    unread: await MessageModel.countDocuments({ty: 'UTU', s: targetUid, r: uid, vd: false})
  });
  // 若对方也需要生成聊天记录，同理
  if(both) {
    let targetChat = await CreatedChatModel.findOne({uid: targetUid, tUid: uid});
    if(!targetChat) {
      targetChat = CreatedChatModel({
        _id: await SettingModel.operateSystemID('createdChat', 1),
        uid: targetUid,
        tUid: uid,
        lmId: message._id
      });
      await targetChat.save();
    }
    await targetChat.updateOne({
      tlm: message.tc,
      lmId: message._id,
      total,
      unread: await MessageModel.countDocuments({ty: 'UTU', s: uid, r: targetUid, vd: false})
    });
  }
};

const CreatedChatModel = mongoose.model('createdChat', chatSchema);
module.exports = CreatedChatModel;