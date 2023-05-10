const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const redisClient = require('../settings/redisClient');
const activeUserSchema = new Schema(
  {
    lWThreadCount: {
      type: Number,
      default: 0,
    },
    lWPostCount: {
      type: Number,
      default: 0,
    },
    vitality: {
      type: Number,
      default: 0,
      index: 1,
    },
    uid: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    toObject: {
      getters: true,
      virtuals: true,
    },
  },
);

activeUserSchema
  .virtual('user')
  .get(function () {
    return this._user;
  })
  .set(function (u) {
    this._user = u;
  });

activeUserSchema.methods.extendUser = async function () {
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOnly({ uid: this.uid });
  return (this.user = user);
};

activeUserSchema.statics.extendUsers = async function (activeUsers) {
  const UserModel = mongoose.model('users');
  const uid = new Set();
  activeUsers.map((a) => {
    uid.add(a.uid);
  });
  let users = await UserModel.find({ uid: { $in: [...uid] } });
  await UserModel.extendUsersInfo(users);
  const usersObj = {};
  users.map((user) => {
    usersObj[user.uid] = user.toObject();
  });
  return await Promise.all(
    activeUsers.map((a) => {
      return usersObj[a.uid];
    }),
  );
};

activeUserSchema.statics.getActiveUsers = async () => {
  const ActiveUserModel = mongoose.model('activeUsers');
  const activeUsers = await ActiveUserModel.find()
    .sort({ vitality: -1 })
    .limit(12);
  return await ActiveUserModel.extendUsers(activeUsers);
};
/*
 * 将一周活跃用户加入缓存
 * @author pengxiguaa 2019-8-5
 * 2021-09-14 调整为取最新注册的 12 个用户
 * */
activeUserSchema.statics.saveActiveUsersToCache = async () => {
  const activeUsers = await mongoose.model('activeUsers').getActiveUsers();
  const activeUsers_ = [];
  for (const u of activeUsers) {
    if (!u) {
      continue;
    }
    activeUsers_.push({
      uid: u.uid,
      avatar: u.avatar,
      username: u.username,
    });
  }
  await redisClient.setAsync('activeUsers', JSON.stringify(activeUsers_));
};
/*
 * 将最新注册的用户加入缓存
 * @author 2021-09-14
 * */
activeUserSchema.statics.saveNewUsersToCache = async () => {
  const UserModel = mongoose.model('users');
  let users = await UserModel.find(
    {
      certs: { $ne: 'banned' },
      avatar: { $ne: '' },
      username: { $ne: '' },
    },
    {
      uid: 1,
      avatar: 1,
      username: 1,
    },
  )
    .sort({ toc: -1 })
    .limit(12);
  users = users.map((u) => {
    const { uid, avatar, username } = u;
    return {
      uid,
      avatar,
      username,
    };
  });
  await redisClient.setAsync('newUsers', JSON.stringify(users));
};
/*
 * 从缓存中取一周活跃用户 [{uid: 用户ID, avatar: 头像}, {}, ...]
 * @author pengxiguaa 2019-8-5
 * 2021-09-14 调整为取最新注册的 12 个用户
 * */
activeUserSchema.statics.getActiveUsersFromCache = async () => {
  const { getUrl } = require('../nkcModules/tools');
  let activeUsers = await redisClient.getAsync('activeUsers');
  const { isProduction } = require('../settings/env');
  try {
    activeUsers = JSON.parse(activeUsers);
  } catch (err) {
    if (!isProduction) {
      console.log(err);
      activeUsers = [];
    }
  }
  activeUsers = activeUsers || [];
  return activeUsers.map((u) => {
    const { uid, username, avatar } = u;
    return {
      username,
      uid,
      avatarUrl: getUrl('userAvatar', avatar),
      homeUrl: getUrl('userHome', uid),
    };
  });
};
/*
 * 从缓存中取最新注册的用户
 * @author pengxiguaa 2021-09-14
 * */
activeUserSchema.statics.getNewUsersFromCache = async () => {
  let newUsers = await redisClient.getAsync('newUsers');
  const { isProduction } = require('../settings/env');
  const { getUrl } = require('../nkcModules/tools');
  try {
    newUsers = JSON.parse(newUsers);
  } catch (err) {
    if (!isProduction) {
      console.log(err);
    }
    newUsers = [];
  }
  for (const u of newUsers) {
    u.avatarUrl = getUrl('userAvatar', u.avatar);
    u.homeUrl = getUrl('userHome', u.uid);
  }
  return newUsers;
};
module.exports = mongoose.model('activeUsers', activeUserSchema, 'activeUsers');
