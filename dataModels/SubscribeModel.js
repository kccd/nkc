const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const schema = new Schema({
  _id: Number,
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
  // thread类型 sub: 关注的文章, post: 自己发表的文章, replay: 回复过的文章, coll: 收藏的文章
  detail: {
    type: String,
    required: "",
    index: 1
  },
  // 关注的发起人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  tUid: {
    type: String,
    default: "",
    index: 1
  },
  fid: {
    type: String,
    default: "",
    index: 1
  },
  tid: {
    type: String,
    default: "",
    index: 1
  }
}, {
  collection: "subscribes"
});

module.exports = mongoose.model('subscribes', schema);