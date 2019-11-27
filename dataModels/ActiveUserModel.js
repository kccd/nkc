const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const redisClient = require("../settings/redisClient");
const activeUserSchema = new Schema({
  lWThreadCount: {
    type: Number,
    default: 0
  },
  lWPostCount: {
    type: Number,
    default: 0
  },
  vitality: {
    type: Number,
    default: 0,
    index: 1
  },
  uid: {
    type: String,
    unique: true,
    required: true
  }
},
{
  toObject: {
    getters: true,
    virtuals: true
  }
});

activeUserSchema.virtual('user')
  .get(function() {
    return this._user;
  })
  .set(function(u) {
    this._user = u;
  });

activeUserSchema.methods.extendUser = async function() {
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOnly({uid: this.uid});
  return this.user = user;
};

activeUserSchema.statics.extendUsers = async function(activeUsers) {
  const UserModel = mongoose.model('users');
  const uid = new Set();
  activeUsers.map(a => {
    uid.add(a.uid);
  });
  let users = await UserModel.find({uid: {$in: [...uid]}});
  await UserModel.extendUsersInfo(users);
  const usersObj = {};
  users.map(user => {
    usersObj[user.uid] = user.toObject();
  });
  return await Promise.all(activeUsers.map(a => {
    return usersObj[a.uid];
  }));
};

activeUserSchema.statics.getActiveUsers = async () => {
  const ActiveUserModel = mongoose.model("activeUsers");
  const activeUsers = await ActiveUserModel.find().sort({ vitality: -1 }).limit(12);
  return await ActiveUserModel.extendUsers(activeUsers);
};
/*
* 将一周活跃用户加入缓存
* @author pengxiguaa 2019-8-5
* */
activeUserSchema.statics.saveActiveUsersToCache = async () => {
  const activeUsers = await mongoose.model("activeUsers").getActiveUsers();
  const activeUsers_ = [];
  for(const u of activeUsers) {
    activeUsers_.push({
      uid: u.uid,
      avatar: u.avatar,
      username: u.username
    });
  }
  await redisClient.setAsync("activeUsers", JSON.stringify(activeUsers_));
};
/*
* 从缓存中取一周活跃用户 [{uid: 用户ID, avatar: 头像}, {}, ...]
* @author pengxiguaa 2019-8-5
* */
activeUserSchema.statics.getActiveUsersFromCache = async () => {
  let activeUsers = await redisClient.getAsync("activeUsers");
  try{
    activeUsers = JSON.parse(activeUsers);
  } catch(err) {
    if(global.NKC.NODE_ENV !== "production") {
      console.log(err);
      activeUsers = [];
    }
  }
  return activeUsers || [];
};
module.exports = mongoose.model('activeUsers', activeUserSchema, 'activeUsers');
