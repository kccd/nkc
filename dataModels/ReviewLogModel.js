const mongoose = require('../settings/database');

const schema = new mongoose.Schema(
  {
    // 内容作者
    uid: {
      type: String,
      required: true,
      index: 1,
    },
    // 来源
    source: {
      type: String,
      required: true,
      index: 1,
    },
    // 来源ID
    sid: {
      type: String,
      required: true,
      index: 1,
    },
    // 触发审核的类型
    triggerType: {
      type: String,
      required: true,
    },
    // 触发审核类型的额外说明，通常为空。
    // 当触发敏感词审核时，会存储触发的敏感词列表，英文逗号分隔
    triggerReason: {
      type: String,
      default: '',
    },
    // 审核状态
    status: {
      type: String,
      required: true,
      index: 1,
    },
    // 管理员ID
    handlerId: {
      type: String,
      default: '',
    },
    // 管理员填写的理由
    handlerReason: {
      type: String,
      default: '',
    },
    // 创建时间
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    // 最后修改时间
    tlm: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'reviewLogs',
  },
);

module.exports = mongoose.model('ReviewLogModel', schema);
