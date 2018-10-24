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

module.exports = mongoose.model('friendsCategories', friendsCategorySchema);