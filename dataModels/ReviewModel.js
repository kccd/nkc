const mongoose = require("../settings/database");
const Schema = mongoose.Schema;

const schema = new Schema({
  _id: Number,
  type: {
    type: "String", // disabledPost, disabledThread, returnPost, returnThread, passPost, passThread
    required: true,
    index: 1
  },
  pid: {
    type: String,
    default: "",
    index: 1
  },
  tid: {
    type: String,
    default: "",
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  handlerId: {
    type: String,
    required: true,
    index: 1
  },
  reason: {
    type: String,
    default: ""
  }
},{
  collection: "reviews"
});
/*
* 生成审核记录
* @param {String} type 审核类型
* @param {Object} post 内容
* @param {Object} user 处理人ID
* @author pengxiguaa 2019-6-3
* */
schema.statics.newReview = async (type, post, user, reason) => {
  await mongoose.model("reviews")({
    _id: await mongoose.model("settings").operateSystemID("reviews", 1),
    type,
    reason,
    pid: post.pid,
    tid: post.tid,
    uid: post.uid,
    handlerId: user.uid
  }).save();
};


module.exports = mongoose.model("reviews", schema);