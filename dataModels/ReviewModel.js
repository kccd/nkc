const mongoose = require("../settings/database");
const Mint = require('mint-filter').default

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

// 文章内容是否触发了敏感词送审条件
schema.statics.includesKeyword = async (post) => {
  const { t, c } = post;
  const SettingModel = mongoose.model("settings");
  const reviewSetting = await SettingModel.getSettings("review");
  const keywordSetting = reviewSetting.keyword;
  if(!keywordSetting) return false;
  if(!keywordSetting.enable) return false;
  const keywordList = keywordSetting.list;
  const { leastKeywordTimes, leastKeywordCount, relationship } = keywordSetting.condition;
  const mint = new Mint(keywordList);
  const titleFilterValue = await mint.filter(t, { replace: false });
  const contentFilterValue = await mint.filter(c, { replace: false });
  if(titleFilterValue.pass && contentFilterValue.pass) return false;
  // 命中敏感词个数
  const hitWordsCount = titleFilterValue.words.length + contentFilterValue.words.length;
  // 总命中次数
  let hitCount = 0;
  titleFilterValue.words.forEach(word => {
    hitCount += (t.match(new RegExp(word, "g")) || []).length
  });
  contentFilterValue.words.forEach(word => {
    hitCount += (c.match(new RegExp(word, "g")) || []).length
  });
  if(relationship === "or") {
    if(hitWordsCount >= leastKeywordCount || hitCount >= leastKeywordTimes) return true;
  } else if(relationship === "and") {
    if(hitWordsCount >= leastKeywordCount && hitCount >= leastKeywordTimes) return true;
  }
  return false;
}

module.exports = mongoose.model("reviews", schema);