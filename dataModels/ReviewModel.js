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

const pureWordRegExp = /([^\u4e00-\u9fa5a-zA-Z0-9])/gi;
// 文章内容是否触发了敏感词送审条件
schema.statics.includesKeyword = async (post) => {
  const { t, c, mainForumsId } = post;
  const targetFid = mainForumsId[0];
  // 拿到目标专业中对敏感词词组的设置
  const ForumModel = mongoose.model("forums");
  const { keywordReviewUseGroup } = await ForumModel.findOne({ fid: targetFid }, { keywordReviewUseGroup: 1 });
  // 拿到全局的敏感词设置
  const SettingModel = mongoose.model("settings");
  const reviewSetting = await SettingModel.getSettings("review");
  const keywordSetting = reviewSetting.keyword;
  if(!keywordSetting) return false;
  if(!keywordSetting.enable) return false;
  const wordGroup = keywordSetting.wordGroup;
  if(!wordGroup.length) return false;
  // 把对应词组的敏感词聚合到一个数组中
  let keywordList = [];
  wordGroup.forEach(group => {
    const { name, keywords } = group;
    if(keywordReviewUseGroup.includes(name)) {
      keywordList = keywordList.concat(keywords);
    }
  });
  // 把待检测文本聚合起来并提取纯文字（无标点符号和空格）
  const content = (t + c).replace(pureWordRegExp, "").toLowerCase();
  // 同样的，把配置的敏感词也提取纯文字
  keywordList = keywordList.map(keyword => keyword.replace(pureWordRegExp, "").toLowerCase());
  // 读取判断逻辑配置
  const { leastKeywordTimes, leastKeywordCount, relationship } = keywordSetting.condition;
  // 开始检测
  const mint = new Mint(keywordList);
  const contentFilterValue = await mint.filter(content, { replace: false });
  // 开始分析检测结果
  if(contentFilterValue.pass) return false;
  // 命中敏感词个数
  const hitWordsCount = contentFilterValue.words.length;
  // 总命中次数
  let hitCount = 0;
  contentFilterValue.words.forEach(word => {
    hitCount += (content.match(new RegExp(word, "g")) || []).length;
  });
  if(relationship === "or") {
    if(hitWordsCount >= leastKeywordCount || hitCount >= leastKeywordTimes) return true;
  } else if(relationship === "and") {
    if(hitWordsCount >= leastKeywordCount && hitCount >= leastKeywordTimes) return true;
  }
  return false;
}

module.exports = mongoose.model("reviews", schema);