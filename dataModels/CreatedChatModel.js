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

/*
* 获取单个对话
* @param {String} 对话类型  UTU, STE, STU, newFriends
* @param {String} uid 当前用户UID
* @param {String} tUid 对方用户UID
* @return {Object}
*   {
*     time: Date,
*     type: String, STE, STU, UTU, newFriends
*     uid: String or null,
*     status: String or null
*     count: Number,
*     name: String,
*     icon: String,
*     abstract: String,
*   }
* */
chatSchema.statics.getSingleChat = async (type, uid, tUid = null) => {
  const FriendModel = mongoose.model('friends');
  const UserModel = mongoose.model('users');
  const translate = require('../nkcModules/translate');
  const {getUrl} = require('../nkcModules/tools');
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const MessageModel = mongoose.model('messages');
  const user = await UserModel.findOne({uid});
  const MessageTypeModel = mongoose.model('messageTypes');
  const FriendsApplicationModel = mongoose.model('friendsApplications');
  const usersGeneral = await UsersGeneralModel.findOne({uid});
  const chat = {
    time: new Date(),
    type,
    uid: null,
    status: null,
    count: 0,
    name: null,
    icon: '',
    abstract: ''
  };
  if(type === 'STE') {
    const {
      newSystemInfoCount,
    } = await user.getNewMessagesCount();
    const message = await MessageModel.findOne({
      ty: 'STE'
    }, {
      ip: 0,
      port: 0
    })
      .sort({tc: -1});
    if(message) {
      chat.time = message.tc;
      chat.abstract = message.c;
    }
    chat.name = '系统通知';
    chat.icon = `/statics/message_type/STE.jpg`;
    chat.count = newSystemInfoCount;
  } else if(type === 'STU') {
    const {
      newReminderCount
    } = await user.getNewMessagesCount();
    const message = await MessageModel.findOne({ty: 'STU', r: user.uid}, {ip: 0, port: 0}).sort({tc: -1});
    const messageType = await MessageTypeModel.findOnly({_id: "STU"});
    if(message) {
      chat.time = message.tc;
      chat.abstract = translate(usersGeneral.language, "messageTypes", message.c.type);
    }
    chat.count = newReminderCount;
    chat.name = messageType.name;
    chat.icon = `/statics/message_type/STU.jpg`;
  } else if(type === 'newFriends') {
    const {
      newApplicationsCount,
    } = await user.getNewMessagesCount();
    const friendsApplication = await FriendsApplicationModel.findOne({respondentId: user.uid}).sort({toc: -1});
    if(friendsApplication) {
      const targetUser = await UserModel.findOne({uid: friendsApplication.applicantId}, {username: 1});
      if(targetUser) {
        chat.time = friendsApplication.toc;
        chat.abstract = `${targetUser.username}申请添加你为好友`;
      }
      chat.count = newApplicationsCount;
      chat.name = '新朋友';
      chat.icon = `/statics/message_type/newFriends.jpg`;
    }
  } else {
    const friend = await FriendModel.findOne({uid, tUid}, {info: 1});
    const targetUser = await UserModel.findOne({uid: tUid});
    const message = await MessageModel.findOne({
      $or: [
        {
          s: uid,
          r: tUid
        },
        {
          r: uid,
          s: tUid
        }
      ]
    }).sort({tc: -1});
    if(message) {
      chat.time = message.tc;
      if(message.withdrawn) {
        chat.abstract = message.r === uid? '对方撤回一条消息': '你撤回了一条消息';
      } else {
        chat.abstract = typeof message.c === 'string'? message.c: message.c.na;
      }
    }
    if(friend && friend.info.name) {
      chat.name = friend.info.name;
    } else {
      chat.name = targetUser.username || targetUser.uid;
    }
    chat.status = await targetUser.getOnlineStatus();
    chat.uid = tUid;
    chat.count = await MessageModel.countDocuments({
      s: tUid,
      r: uid,
      vd: false
    });
    chat.icon = getUrl('userAvatar', targetUser.avatar);
  }
  return chat;
};

/*
* 获取已创建的对话列表
* */

chatSchema.statics.getCreatedChat = async (uid) => {
  const CreatedChatModel = mongoose.model('createdChat');
  const UserModel = mongoose.model('users');
  const MessageModel = mongoose.model('messages');
  const FriendModel = mongoose.model('friends');
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const MessageTypeModel = mongoose.model('messageTypes');
  const FriendsApplicationModel = mongoose.model('friendsApplications');
  const translate = require('../nkcModules/translate');
  const user = await UserModel.findOnly({uid});
  const {getUrl} = require('../nkcModules/tools');
  const chats = await CreatedChatModel.find({uid}).sort({tlm: -1});
  const uidArr = new Set();
  const midArr = new Set();
  const userObj = {};
  const messageObj = {};
  const friendObj = {};
  const chatList = [];
  for(const c of chats) {
    uidArr.add(c.tUid);
    if(c.lmId) midArr.add(c.lmId);
  }
  const users = await UserModel.find({
    uid: {
      $in: [...uidArr]
    }
  }, {
    uid: 1,
    username: 1,
    avatar: 1,
    online: 1,
    onlineType: 1,
    description: 1,
  });
  const messages = await MessageModel.find({
    _id: {
      $in: [...midArr]
    }
  }, {
    ip: 0,
    port: 0
  });
  const friendsArr = await FriendModel.find({
    uid,
    tUid: {
      $in: [...uidArr]
    }
  });
  for(const u of users) {
    userObj[u.uid] = u;
  }
  for(const m of messages) {
    messageObj[m._id] = m;
  }
  for(const f of friendsArr) {
    friendObj[f.tUid] = f;
  }
  for(const c of chats) {
    if(c.tUid === uid) continue;
    const {
      unread,
      tUid,
      lmId,
      tlm,
      toc,
    } = c;
    let message = messageObj[lmId];
    if(!message) {
      message = {
        _id: null,
        ty: "UTU",
        c: "",
        tc: c.toc
      }
    }
    const targetUser = userObj[tUid];
    if(!targetUser) continue;
    const friend = friendObj[tUid];
    let abstract;
    if(message.withdrawn) {
      abstract = message.r === uid? '对方撤回了一条消息': '你撤回了一条消息';
    } else {
      abstract = typeof message.c === 'string'? message.c: message.c.na;
    }
    let name;
    if(friend) {
      name = friend.info.name;
    }
    name = name || targetUser.username || targetUser.uid;
    const status = await targetUser.getOnlineStatus();
    chatList.push({
      time: tlm || toc, // 最近更新时间
      type: 'UTU', // 对话类型 UTU(用户间) STU(应用通知) STE(系统通知)
      name, // 显示的名称 昵称或者是用户填写的备注信息
      uid: targetUser.uid, // 对方ID
      icon: getUrl('userAvatar', targetUser.avatar), // 显示的头像
      status, // 在线状态
      abstract, // 摘要
      count: unread // 未读条数
    });
  }
  const usersGeneral = await UsersGeneralModel.findOne({uid});
  const t = Date.now();
  const {
    newSystemInfoCount,
    newApplicationsCount,
    newReminderCount
  } = await user.getNewMessagesCount();
  const {chat}= usersGeneral.messageSettings;

  const insertChat = (arr, item) => {
    let itemTime = item.time.getTime();
    for(let i = 0; i < arr.length; i++) {
      const chat = arr[i];
      if(itemTime > chat.time.getTime()) {
        arr.splice(i, 0, item);
        itemTime = 'inserted';
        break;
      }
    }
    if(itemTime !== 'inserted') {
      arr.push(item);
    }
  };

  if(chat.systemInfo) {
    const [message] = (await MessageModel.getMySystemInfoMessage(uid)).reverse();
    if(message) {
      insertChat(chatList, {
        time: message.tc,
        type: 'STE',
        uid: null,
        status: null,
        count: newSystemInfoCount,
        name: '系统通知',
        icon: '/statics/message_type/STE.jpg',
        abstract: message.c.content,
      });
    }
  }
  if(chat.reminder) {
    const message = await MessageModel.findOne({ty: 'STU', r: user.uid}, {ip: 0, port: 0}).sort({tc: -1});
    const messageType = await MessageTypeModel.findOnly({_id: "STU"});
    if(message) {
      insertChat(chatList, {
        time: message.tc,
        name: messageType.name,
        type: 'STU',
        uid: null,
        status: null,
        count: newReminderCount,
        icon: '/statics/message_type/STU.jpg',
        abstract: translate(usersGeneral.language, "messageTypes", message.c.type),
      });
    }
  }
  if(chat.newFriends) {
    const friendsApplication = await FriendsApplicationModel.findOne({respondentId: user.uid}).sort({toc: -1});
    if(friendsApplication) {
      const targetUser = await UserModel.findOne({uid: friendsApplication.applicantId}, {username: 1});
      if(targetUser) {
        insertChat(chatList, {
          type: 'newFriends',
          time: friendsApplication.toc,
          count: newApplicationsCount,
          uid: null,
          status: null,
          name: '新朋友',
          icon: '/statics/message_type/newFriends.jpg',
          abstract: `${targetUser.username}申请添加你为好友`,
        });
      }
    }
  }
  return chatList;
};

/*
* 删除与某人的对话
* @param {String} type UTU, STU, STE, newFriends
* @param {String} uid 自己
* @param {String} tUid 对方的ID
* @author pengxiguaa 2021-6-3
* */
chatSchema.statics.removeChat = async (type, uid, tUid) => {
  const CreatedChatModel = mongoose.model('createdChat');
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const MessageModel = mongoose.model('messages');
  await MessageModel.markAsRead(type, uid, tUid);
  if(type === 'UTU') {
    const chat = await CreatedChatModel.findOne({uid, tUid});
    if(chat) await chat.deleteOne();
  } else if(type === 'STU') {
    await UsersGeneralModel.updateOne({uid}, {
      $set: {'messageSettings.chat.reminder': false}
    });
  } else if(type === 'STE') {
    await UsersGeneralModel.updateOne({uid}, {
      $set: {'messageSettings.chat.systemInfo': false}
    });
  } else if(type === 'newFriends') {
    await UsersGeneralModel.updateOne({uid}, {
      $set: {'messageSettings.chat.newFriends': false}
    });
  }
};

module.exports =  mongoose.model('createdChat', chatSchema);
