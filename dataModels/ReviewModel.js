/* 
  2025-12-09 pxgo
  当前表已废弃，审核记录现存在 ReviewLogModel 中
*/

const mongoose = require('../settings/database');
const Mint = require('mint-filter').default;
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    _id: Number,
    type: {
      // disabledPost
      // disabledThread
      // returnPost
      // returnThread
      // passPost
      // passThread
      // disabledDocument
      // returnDocument
      // passDocument
      // deleteDocument
      type: String,
      required: true,
      index: 1,
    },
    // 当审核对象为 document 时，此字段为 document innerId
    // 当审核对象为 note时,此字段为note innerId
    docId: {
      type: Number,
      default: null,
      index: 1,
    },
    // doc,note
    // source:{
    //   type: string,
    //   default: null,
    //   index: 1
    // },

    pid: {
      type: String,
      default: '',
      index: 1,
    },
    tid: {
      type: String,
      default: '',
      index: 1,
    },
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    uid: {
      type: String,
      required: true,
      index: 1,
    },
    reason: {
      type: String,
      default: '',
    },
    handlerId: {
      type: String,
      default: '',
      index: 1,
    },
    source: {
      type: String,
      required: true,
      index: 1,
    },
    sid: {
      type: String,
      required: true,
      index: 1,
    },
  },
  {
    collection: 'reviews',
  },
);
//返回source数据来源
const source = {
  post: 'post',
  document: 'document',
  note: 'note',
};

//返回数据来源
schema.statics.getDocumentSources = async () => {
  return { ...source };
};

/*
 * 生成审核记录
 * @param {String} type 审核类型
 * @param {Object} post 内容
 * @param {Object} user 处理人ID
 * @author pengxiguaa 2019-6-3
 * */
//type, post, user, reason, document  ----之前的数据形式,
//pid，tid,uid,已经废弃，添加了，sid作为公共的id，以及source标注sid来源
// schema.statics.newReview = async (type, post, user, reason, document,source) => {
//   await mongoose.model("reviews")({
//     _id: await mongoose.model("settings").operateSystemID("reviews", 1),
//     type,
//     reason,
//     docId: document?document._id:'',
//     pid: post?post.pid:'',
//     tid: post?post.tid:'',
//     uid: post?post.uid:document.uid,
//     handlerId: user.uid
//   }).save();
// };
//生成审核记录---新
schema.statics.newReview = async ({
  type,
  sid,
  uid,
  reason,
  handlerId,
  source,
}) => {
  if (source === 'document') {
    sid = sid.toString();
  }
  await mongoose
    .model('reviews')({
      _id: await mongoose.model('settings').operateSystemID('reviews', 1),
      type,
      sid,
      uid,
      reason,
      handlerId,
      source,
    })
    .save();
};

const pureWordRegExp = /([^\u4e00-\u9fa5a-zA-Z0-9-_,.，。!！])/gi;
const MatchedKeyword = { result: [] };

schema.statics.matchKeywords = async (content, groups) => {
  const SettingModel = mongoose.model('settings');
  const reviewSettings = await SettingModel.getSettings('review');
  const keywordSettings = reviewSettings.keyword;
  if (!keywordSettings) {
    return [];
  }
  if (!keywordSettings.enable) {
    return [];
  }
  const { wordGroup } = keywordSettings;
  if (!wordGroup || wordGroup.length === 0) {
    return [];
  }
  content = content
    .replace(/\n/gi, '')
    .replace(pureWordRegExp, '')
    .toLowerCase();
  let results = [];
  for (const group of groups) {
    let { keywords } = group;
    keywords = keywords.map((keyword) =>
      keyword.replace(/\n/gi, '').replace(pureWordRegExp, '').toLowerCase(),
    );
    const {
      times: leastKeywordTimes,
      count: leastKeywordCount,
      logic: relationship,
    } = group.conditions;

    const mint = new Mint(keywords);
    const contentFilterValue = await mint.filter(content, { replace: false });
    // 保存结果
    const matchedKeywords = [].concat(contentFilterValue.words);
    // 开始分析检测结果
    if (contentFilterValue.pass) {
      continue;
    } // 代表没有命中任何关键词
    // 命中敏感词个数
    const hitWordsCount = contentFilterValue.words.length;
    // 总命中次数
    let hitCount = 0;

    contentFilterValue.words.forEach((word) => {
      hitCount += (content.match(new RegExp(word, 'g')) || []).length;
    });
    if (relationship === 'or') {
      if (hitWordsCount >= leastKeywordCount || hitCount >= leastKeywordTimes) {
        results = results.concat(matchedKeywords);
      }
    } else if (relationship === 'and') {
      if (hitWordsCount >= leastKeywordCount && hitCount >= leastKeywordTimes) {
        results = results.concat(matchedKeywords);
      }
    }
  }

  return [...new Set(results)];
};
// 文章内容是否触发了敏感词送审条件
schema.statics.includesKeyword = async ({ content, useGroups }) => {
  // 拿到全局的敏感词设置
  const SettingModel = mongoose.model('settings');
  const reviewSetting = await SettingModel.getSettings('review');
  const keywordSetting = reviewSetting.keyword;
  if (!keywordSetting) {
    return false;
  }
  if (!keywordSetting.enable) {
    return false;
  }
  const wordGroup = keywordSetting.wordGroup;
  if (!wordGroup.length) {
    return false;
  }
  // 把待检测文本聚合起来并提取纯文字（无标点符号和空格）
  let pure_content = content
    .replace(/\n/gi, '')
    .replace(pureWordRegExp, '')
    .toLowerCase();
  // 循环采用每一个设置的敏感词组做一遍检测
  const groupsId = wordGroup.map((g) => g.id);
  useGroups = useGroups.filter((g) => groupsId.includes(g.id));

  for (const group of wordGroup) {
    const { id } = group;
    if (!useGroups.includes(id)) {
      continue;
    }
    let keywordList = group.keywords;
    // 把此组中配置的敏感词也提取纯文字
    keywordList = keywordList.map((keyword) =>
      keyword.replace(/\n/gi, '').replace(pureWordRegExp, '').toLowerCase(),
    );
    // 读取判断逻辑配置
    const {
      times: leastKeywordTimes,
      count: leastKeywordCount,
      logic: relationship,
    } = group.conditions;
    // 开始检测
    const mint = new Mint(keywordList);
    const contentFilterValue = await mint.filter(pure_content, {
      replace: false,
    });
    // 保存结果
    MatchedKeyword.result = [].slice.call(contentFilterValue.words);
    // 开始分析检测结果
    if (contentFilterValue.pass) {
      continue;
    } // 代表没有命中任何关键词
    // 命中敏感词个数
    const hitWordsCount = contentFilterValue.words.length;
    // 总命中次数
    let hitCount = 0;
    contentFilterValue.words.forEach((word) => {
      hitCount += (content.match(new RegExp(word, 'g')) || []).length;
    });
    if (relationship === 'or') {
      if (hitWordsCount >= leastKeywordCount || hitCount >= leastKeywordTimes) {
        return true;
      }
    } else if (relationship === 'and') {
      if (hitWordsCount >= leastKeywordCount && hitCount >= leastKeywordTimes) {
        return true;
      }
    }
  }
  return false;
};

/*
 * 更新审核记录的处理人uid
 * */
schema.methods.updateReview = async function (props) {
  const { uid, type, reason } = props;
  await this.updateOne({
    $set: {
      handlerId: uid,
      type,
      reason,
    },
  });
};

module.exports = mongoose.model('reviews', schema);
