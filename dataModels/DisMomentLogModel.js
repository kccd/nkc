const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const disMomentLogSchema = new Schema(
  {
    // 被屏蔽的原因
    reason: {
      type: String,
      default: '',
    },
    // 被屏蔽电文类型 电文还是评论
    // moment(电文)、comment（电文评论）
    momentType: {
      type: String,
      default: '',
    },
    momentId: {
      type: String,
      index: 1,
      default: '',
    },
    // 屏蔽是否通知用户
    noticeUser: {
      type: Boolean,
      default: true,
    },
    // 是否解除屏蔽
    recovered: {
      type: Boolean,
      default: false,
    },
    // 操作用户id
    operator: {
      type: String,
      default: '',
      index: 1,
    },
    // 被屏蔽用户id
    uid: {
      type: String,
      default: '',
      index: 1,
    },
  },
  {
    collection: 'disMomentLogs',
    timestamps: {
      createdAt: 'toc', // 自动生成创建时间
      updatedAt: 'tlm', // 自动维护更新时间
    },
  },
);
disMomentLogSchema.statics.createLog = async function ({
  reason = '',
  momentType = '',
  momentId = '',
  noticeUser = true,
  recovered = false,
  operator = '',
  uid = '',
}) {
  const log = new this({
    reason,
    momentType,
    momentId,
    noticeUser,
    recovered,
    operator,
    uid,
  });
  return await log.save();
};

module.exports = mongoose.model('disMomentLogs', disMomentLogSchema);
