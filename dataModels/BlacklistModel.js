const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 用户ID
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 被拉黑用户ID
  tUid: {
    type: String,
    required: true,
    index: 1
  },
  // 拉黑时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 拉黑的位置，名片：userCard, message, post
  from: {
    type: String,
    required: true,
    index: 1,
  },
  // 拉黑来源
  pid: {
    type: String,
    default: '',
    index: 1
  }
}, {
  collection: "blacklists"
});

/*
* 添加用户到黑名单中
* @param {String} uid 用户ID
* @param {String} tUid 被拉黑用户ID
* @param {String} type 拉黑来源，message: 消息系统, userCard: 用户名片, post: 文章/回复/评论
* @param {String} pid 拉黑来源为post时所对应的pid
* @return {Object} list 创建的拉黑记录
* @author pengxiguaa 2020/06/05
* */
schema.statics.addUserToBlacklist = async (uid, tUid, from, pid = '') => {
  if(uid === tUid) throwErr(400, `不允许添加自己到黑名单`);
  const BL = mongoose.model('blacklists');
  const SettingModel = mongoose.model('settings');
  const UserModel = mongoose.model('users');
  const targetUser = await UserModel.findOne({uid: tUid});
  if(!targetUser) throwErr(400, `用户id错误 uid: ${tUid}`);
  let list = await BL.findOne({uid, tUid});
  if(list) throwErr(400, '对方已在黑名单中');
  list = BL({
    _id: await SettingModel.operateSystemID('blacklists', 1),
    uid,
    tUid,
    from,
    pid
  });
  await list.save();
  return list;
};

/*
* 将用户移出黑名单
* @param {String} uid 用户ID
* @param {String} tUid 被移出的用户
* @author pengxiguaa 2020/06/05
* */
schema.statics.removeUserFromBlacklist = async (uid, tUid) => {
  const BL = mongoose.model('blacklists');
  const list = await BL.findOne({uid, tUid});
  if(list) await list.remove();
};

/*
* 判断用户是否在黑名单中
* @param {String} uid 用户ID
* @param {String} tUid 被判断用户ID
* @return {Boolean} true/false
* @author pengxiguaa 2020/06/05
* */
schema.statics.inBlacklist = async (uid, tUid) => {
  const BL = mongoose.model('blacklists');
  const list = await BL.findOne({uid, tUid});
  return !!list;
};

/*
* 获取用户黑名单中所有用户的ID
* @param {String} uid 用户ID
* @return {[String]} 用户ID组成的数组
* @author pengxiguaa 2020/6/8
* */
schema.statics.getBlacklistUsersId = async (uid) => {
  const BlacklistModel = mongoose.model('blacklists');
  const list = await BlacklistModel.find({uid}).sort({toc: -1});
  return list.map(l => l.tUid);
};

/*
* 获取用户的拉黑数量和被拉黑数量
* @param {String} uid 用户ID
* @return {Object} {count, tCount}
* */
schema.statics.getBlacklistCount = async (uid) => {
  const BlacklistModel = mongoose.model("blacklists");
  const count = await BlacklistModel.count({uid});
  const tCount = await BlacklistModel.count({tUid: uid});
  return {
    count,
    tCount
  };
}

/*
* 获取被拉黑的提示
* @param {String} uid 用户ID
* @param {String} tUid 被来黑用户ID
* @param {Boolean} canSendToEveryOne 是否具有消息系统的管理权限
* @return {String} 相应提示
* */
schema.statics.getBlacklistInfo = async (uid, tUid, canSendToEveryOne) => {
  const BlacklistModel = mongoose.model("blacklists");
  const bl = await BlacklistModel.findOne({uid, tUid});
  if(bl) {
    if(canSendToEveryOne) {
      return '你在对方的黑名单中，对方可能不希望与你交流，要继续吗？';
    } else {
      return '你在对方的黑名单中，对方可能不希望与你交流。';
    }
  }
}

/*
* 判断用户的黑名单中是否存在指定用户
* @param {String} uid user ID
* @param {String} tUid 目标用户ID
* @return {Boolean}
* @author pengxiguaa 2020-12-15
* */
schema.statics.checkUser = async (uid, tUid) => {
  const BlacklistModel = mongoose.model('blacklists');
  const count = await BlacklistModel.count({uid, tUid});
  return count > 0;
};
module.exports = mongoose.model("blacklists", schema);
