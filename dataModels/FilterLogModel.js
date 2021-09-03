const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  // 过滤类型
  type: {
    type: String, // post
    required: true
  },
  // 开始时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 操作人 ID
  operatorId: {
    type: String,
    required: true,
  },
  // 状态
  status: {
    type: String,
    default: 'waiting', // waiting, processing, completed
  },
  // 敏感词组
  groups: {
    type: [{
      id: String,  // group, custom
      name: String,
      keywords: [String],
      conditions: {
        count: Number,
        times: Number,
        logic: String, // or, and
      }
    }],
    default: []
  },
  // 是否标记为待审核
  markUnReview: {
    type: Boolean,
    default: false,
  },
  // 最后操作时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 时间范围限制
  timeLimit: {
    type: {
      type: String, // all, custom
      default: 'all'
    },
    start: {
      type: Date,
      default: null
    },
    end: {
      type: Date,
      default: null
    }
  },
  // 处理结果
  result: {
    // 待判断内容总数
    total: {
      type: Number,
      default: 0,
    },
    // 以判断内容总数
    progress: {
      type: Number,
      default: 0,
    },
    // 触发敏感词的内容 ID
    targetId: {
      type: [String],
      default: []
    },
  },
  errorInfo: {
    type: String,
    default: ''
  }
}, {
  collection: 'filterLogs'
});
schema.methods.saveErrorInfo = async function(errorInfo = '') {
  this.updateOne({
    $set: {
      'result.errorInfo': errorInfo.toString()
    }
  });
}
schema.methods.markAsProcessing = async function() {
  await this.updateOne({
    status: 'processing',
    tlm: new Date()
  });
};

schema.methods.markAsCompleted = async function() {
  await this.updateOne({
    status: 'completed',
    tlm: new Date(),
  });
};

schema.methods.updateTotal = async function(total) {
  this.result.total = total;
  await this.save();
};
schema.methods.updateResultCount = async function(progress, targetId = []) {
  await this.updateOne({
    $addToSet: {
      'result.targetId': {
        $each: targetId
      }
    },
    $inc: {
      'result.progress': progress
    }
  });
};


module.exports = mongoose.model('filterLogs', schema);
