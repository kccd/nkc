const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

let HistoriesSchema = new Schema({
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
  },/* 
  fid: {
    type: String,
    // required: true,
    index: 1
  }, */
  // 主要分类
  mainForumsId: {
    type: [String],
    default: [],
    index: 1
  },
  // 辅助分类
  minorForumsId: {
    type: [String],
    default: [],
    index: 1
  },
  // 自定义分类
  customForumsId: {
    type: [String],
    default: [],
    index: 1
  },
  tid: {
    type: String,
    required: true,
    index: 1
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
  anonymous: {
    type: Boolean,
    default: false
  },
	digest: Boolean,
	hideHistories: Boolean,
	hasImage: Boolean,
	toDraft: Boolean
});

HistoriesSchema.pre('save', function(next) {
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

module.exports = mongoose.model('histories', HistoriesSchema);