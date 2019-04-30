const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
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
  const users = await mongoose.model('users').find({certs: {$ne: "banned"}}).sort({tlv: -1}).limit(12);
  return await mongoose.model("users").extendUsersInfo(users);
};
module.exports = mongoose.model('activeUsers', activeUserSchema, 'activeUsers');
