const mongoose = require('../settings/database');
const apiFunction = require('../nkcModules/apiFunction');

const schema = new mongoose.Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  type: {
    type: String,
    required: true,
    index: 1,
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  ip: {
    type: String,
    default: '',
    index: 1,
  },
  port: {
    type: String,
    default: '',
    index: 1
  },
  // 与之相关的积分记录ID
  recordsId: {
    type: [String],
    default: [],
    index: 1
  }
}, {
  collection: 'scoreOperationLogs'
});

/**
 * 获取用户今日内指定的操作的次数
 * @param {Object} user 用户记录
 * @param {String} type 操作类型
 */
schema.statics.getOperationLogCount = async function(user, type) {
  const ScoreOperationLogModel = mongoose.model('scoreOperationLogs');
  return await ScoreOperationLogModel.count({
    uid: user.uid,
    type,
    toc: {$gte: apiFunction.today()}
  });
}

/**
 * 获取用户某附件最近一次下载操作记录
 * @param {Object} user 用户记录
 * @param {String} rid 附件id
 */
schema.statics.getLastAttachmentDownloadLog = async function(user, rid) {
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  return await KcbsRecordModel.findOne({
    from: user.uid,
    type: "attachmentDownload",
    rid
  }).sort({toc: -1});
}


module.exports = mongoose.model('scoreOperationLogs', schema);
