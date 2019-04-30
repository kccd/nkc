// 用户的关注，分为：关注的用户、关注的专业、关注的文章

const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const schema = new Schema({
  _id: Number,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 类型
  // 1. thread 关注的文章
  // 2. forum 关注的专业
  // 3. user 关注的用户
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 详细类型
  // thread类型 sub: 关注的文章, post: 自己发表的文章, replay: 回复过的文章
  detail: {
    type: String,
    default: "",
    index: 1
  },
  // 关注的发起人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 若为关注用户，此字段表示关注的人ID
  tUid: {
    type: String,
    default: "",
    index: 1
  },
  // 关注的专业ID
  fid: {
    type: String,
    default: "",
    index: 1
  },
  // 关注的文章ID
  tid: {
    type: String,
    default: "",
    index: 1
  }
}, {
  collection: "subscribes"
});
/*
* 获取用户专注的所有用户的ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-4-28
* */
schema.statics.getUserSubUid = async (uid) => {
  const SubscribeModel = mongoose.model("subscribes");
  const sub = await SubscribeModel.find({
    type: 'user',
    uid
  });
  return sub.map(s => s.tUid);
};

module.exports = mongoose.model('subscribes', schema);