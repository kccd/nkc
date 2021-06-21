const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new Schema({

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
  toc: {
    type: Date,
    index: 1,
    default: Date.now
  },
  tlm: {
    type: Date,
    index: 1
  },
  cid: {
    type: [Number],
    index: 1,
    default: []
  },
  info: {
    name: {
      type: String,
      default: ''
    },
    phone: {
      type: [String],
      default: ['']
    },
    location: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: Boolean,
      default: false
    }
  }
}, {
  collection: 'friends',
  toObject: {
    getters: true,
    virtuals: true
  }
});

friendSchema.virtual('targetUser')
  .get(function() {
    return this._targetUser;
  })
  .set(function(targetUser) {
    this._targetUser = targetUser;
  });

friendSchema.pre('save', function(next) {
  if(!this.tlm) this.tlm = this.toc;
  next();
});


friendSchema.statics.getFriends = async (uid) => {
  const FriendModel = mongoose.model('friends');
  const UserModel = mongoose.model('users');
  const {getUrl} = require('../nkcModules/tools');
  const {getGroupsByFirstLetter} = require('../nkcModules/pinyin');
  const friends = await FriendModel.find({uid});
  const usersId = [];
  const usersObj = {};
  for(const friend of friends) {
    usersId.push(friend.tUid);
  }
  const users = await UserModel.find({uid: {$in: usersId}}, {
    uid: 1,
    username: 1,
    avatar: 1,
    online: 1,
    onlineType: 1,
    description: 1,
  });
  for(const u of users) {
    usersObj[u.uid] = u;
  }
  let userList = [];
  for(const friend of friends) {
    const {tUid, _id} = friend;
    const {name} = friend.info;
    const targetUser = usersObj[tUid];
    if(!targetUser) continue;
    userList.push({
      _id,
      status: await targetUser.getOnlineStatus(),
      uid: targetUser.uid,
      name: name || targetUser.username || targetUser.uid,
      icon: getUrl('userAvatar', targetUser.avatar),
      abstract: targetUser.description || '',
      type: 'UTU'
    });
  }
  userList = getGroupsByFirstLetter(userList, 'name');
  userList.unshift({
    title: '系统',
    data: [
      {
        _id: null,
        name: '系统通知',
        icon: '/statics/message_type/STE.jpg',
        abstract: `系统通知`,
        type: 'STE',
        status: null,
        uid: null,
      },
      {
        _id: null,
        name: '应用提醒',
        icon: '/statics/message_type/STU.jpg',
        abstract: `应用提醒`,
        type: 'STU',
        status: null,
        uid: null,
      },
      {
        _id: null,
        name: '新朋友',
        icon: '/statics/message_type/newFriends.jpg',
        abstract: `申请添加好友`,
        type: 'newFriends',
        status: null,
        uid: null,
      },
    ]
  });
  return userList;
};

/*
* 取消建立好友关系 移除对话系信息和好友信息
* @param {String} uid 自己ID
* @param {String} tUid 对方ID
* @author pengxiguaa 2021-6-3
* */
friendSchema.statics.removeFriend = async (uid, tUid) => {
  const FriendModel = mongoose.model('friends');
  const CreatedChatModel = mongoose.model('createdChat');
  const FriendsCategoryModel = mongoose.model('friendsCategories');
  await CreatedChatModel.removeChat('UTU', uid, tUid);
  await CreatedChatModel.removeChat('UTU', tUid, uid);
  await FriendsCategoryModel.removeFromAllCategory(uid, tUid);
  const myFriend = await FriendModel.findOne({uid, tUid});
  const hisFriend = await FriendModel.findOne({uid: tUid, tUid: uid});
  if(myFriend) await myFriend.deleteOne();
  if(hisFriend) await hisFriend.deleteOne();
};

/*
* 建立好友关系
* @param {String} uid 自己ID
* @param {String} tUid 对方ID
* @author pengxiguaa 2021-6-3
* */

friendSchema.statics.createFriend = async (uid, tUid) => {
  const FriendModel = mongoose.model('friends');
  const SettingModel = mongoose.model('settings');
  const CreatedChatModel = mongoose.model('createdChat');
  await FriendModel.removeFriend(uid, tUid);
  const toc = Date.now();
  const myFriend = FriendModel({
    _id: await SettingModel.operateSystemID('friends', 1),
    uid,
    tUid,
    toc
  });
  const hisFriend = FriendModel({
    _id: await SettingModel.operateSystemID('friends', 1),
    uid: tUid,
    tUid: uid,
    toc
  });
  await myFriend.save();
  await hisFriend.save();
  await CreatedChatModel.createChat(uid, tUid, true);
};

/*
* 获取用户的所有好友的ID
* @param {String} uid 当前用户
* @return {[String]}
* @author pengxiguaa 2021-6-4
* */
friendSchema.statics.getFriendsUid = async (uid) => {
  const FriendModel = mongoose.model('friends');
  const friends = await FriendModel.find({uid}, {tUid: 1});
  return friends.map(f => f.tUid);
};

/*
* 拓展分类字段
* @return {[Number]} 分组ID
* @author pengxiguaa 2021-6-4
* */
friendSchema.methods.extendCid = async function() {
  const FriendsCategoryModel = mongoose.model('friendsCategories');
  const categories = await FriendsCategoryModel.find({friendsId: this.tUid}, {_id: 1});
  return this.cid = categories.map(c => c._id);
};

const FriendModel = mongoose.model('friends', friendSchema);

module.exports = FriendModel;