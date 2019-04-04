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
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const usersObj = {};
  users.map(user => {
    usersObj[user.uid] = user;
  });
  return await Promise.all(activeUsers.map(a => {
    a.user = usersObj[a.uid];
    return a;
  }));
};

module.exports = mongoose.model('activeUsers', activeUserSchema, 'activeUsers');
