const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const schema = new Schema({
  pid: {
    type: String,
    required: true,
    index: 1
  },
  t: {
    type: String,
    default: ""
  },
  c: {
    type: String,
    default: ""
  },
  ipoc: {
    type: String,
    default: ""
  },
  iplm: {
    type: String,
    default: ""
  },
  l: {
    type: String,
    default: ""
  },
  toc: {
    type: Date,
    required: true,
    index: 1
  },
  tlm: Date,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  uidlm: {
    type: String,
    default: "",
    index: 1
  },
  cv: {
    type: Number
  },
  // 中文摘要
  abstractCn: {
    type: String,
    default: ""
  },
  // 英文摘要
  abstractEn: {
    type: String,
    default: ""
  },
  // 中文关键词
  keyWordsCn: {
    type: Array,
    default: []
  },
  // 英文关键词
  keyWordsEn: {
    type: Array,
    default: []
  },
  // 作者信息
  authorInfos: {
    type: Array,
    default: []
  },
  // 封面图图片hash
  cover: {
    type: String,
    default: ""
  }
});

/*let HistoriesSchema = new Schema({
  pid: {
    type: String,
    required: true
  },
  atUsers: {
    type: [Schema.Types.Mixed],
    default: []
  },
  c: {
    type: String,
    default: ''
  },
  credits: {
    type: [Schema.Types.Mixed],
    default: []
  },
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  ipoc: {
    type: String,
    default: '0.0.0.0'
  },
  iplm: {
    type: String,
  },
  l: {
    type: String,
    required: true
  },
  r: {
    type: [String],
    default: [],
    index: 1
  },
  recUsers: {
    type: [String],
    default: []
  },
  rpid: {
    type: [String],
    default: []
  },
  t: {
    type: String,
    default: ''
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  uidlm: {
    type: String,
    index: 1
  },
  // 内容版本号
  cv: {
    type: Number
  }
});*/

schema.pre('save', function(next) {
  try {
    if (!this.iplm) {
      this.iplm = this.ipoc;
    }
    if (!this.uidlm) {
      this.uidlm = this.uid;
    }
    if (!this.tlm) {
      this.tlm = this.toc
    }
    next()
  } catch(e) {
    return next(e)
  }
});

/*
* 创建历史记录
* @param {Object} oldPost 修改前的post
* @return {Object}  history
* @author pengxiguaa 2020-3-30
* */
schema.statics.createHistory = async (oldPost) => {
  const model = mongoose.model("histories");
  let history = Object.assign({}, oldPost);
  delete history._id;
  delete history.__v;
  history = model(history);
  await history.save();
  return history;
};

module.exports = mongoose.model('histories', schema);