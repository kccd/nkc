const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const friendsCategorySchema = new Schema({
  _id: Number,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: 'String',
    index: 1,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  // 分组内的用户Id
  friendsId: {
    type: [String],
    default: [],
    index: 1
  }
}, {
  collection: 'friendsCategories',
  toObject: {
    getters: true,
    virtuals: true
  }
});

friendsCategorySchema.virtual('friends')
  .get(function() {
    return this._friends;
  })
  .set(function(friends) {
    this._friends = friends;
  });

friendsCategorySchema.methods.extendFriends = async function() {
  const UserModel = mongoose.model('users');
  const FriendModel = mongoose.model('friends');
  const friends = [];
  for(const uid of this.friendsId) {
    const friend = await FriendModel.findOne({uid: this.uid, tUid: uid});
    const user = await UserModel.findOne({uid});
    if(!friend || !user) continue;
    friend.targetUser = user;
    friends.push(friend.toObject());
  }
  return this.friends = friends;
};

friendsCategorySchema.statics.getCategories = async (uid) => {
  const FriendCategoryModel = mongoose.model('friendsCategories');
  const FriendModel = mongoose.model('friends');
  const UserModel = mongoose.model('users');
  const {getUrl} = require('../nkcModules/tools');
  const categories = await FriendCategoryModel.find({uid}).sort({toc: -1});
  const categoryList = [];
  const friendsUid = await FriendModel.getFriendsUid(uid);
  const users = await UserModel.find({uid: {$in: friendsUid}}, {
    uid: 1,
    avatar: 1
  });
  const usersObj = {};
  for(const u of users) {
    usersObj[u.uid] = u;
  }
  for(const c of categories) {
    const {name, description, friendsId, _id} = c;
    const avatars = [];
    for(const uid of friendsId) {
      if(!uid) continue;
      const targetUser = usersObj[uid];
      if(!targetUser) continue;
      avatars.push(getUrl('userAvatar', targetUser.avatar));
    }
    categoryList.push({
      name,
      abstract: description,
      friendsId,
      _id,
      icon: avatars.slice(0, 9)
    });
  }
  return categoryList;
};
/*
* 将某个用户从自己的所有分组中移除
* @param {String} uid 当前用户
* @param {String} tUid 目标用户
* @author pengxiguaa 2021-6-4
* */
friendsCategorySchema.statics.removeFromAllCategory= async (uid, tUid) => {
  const FriendsCategoryModel = mongoose.model('friendsCategories');
  await FriendsCategoryModel.updateMany({
    uid
  }, {
    $pull: {
      friendsId: tUid
    }
  });
};

/*
* 更新某个好友的分组信息
* @param {String} uid 当前用户
* @param {String} tUid 目标用户
* @param {[Number]} cid 分组ID
* */
friendsCategorySchema.statics.updateFriendCategories = async (uid, tUid, cid) => {
  const FriendsCategoryModel = mongoose.model('friendsCategories');
  await FriendsCategoryModel.removeFromAllCategory(uid, tUid);
  await FriendsCategoryModel.updateMany({
    uid,
    _id: {$in: cid}
  }, {
    $addToSet: {
      friendsId: tUid
    }
  });
};

module.exports = mongoose.model('friendsCategories', friendsCategorySchema);