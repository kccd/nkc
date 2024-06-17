const mongoose = require('mongoose');
const collectionName = 'sensitiveCheckerLogs';
const { sensitiveCheckerStatus } = require('../settings/sensitiveChecker');
const { sensitiveTypes } = require('../settings/sensitiveSetting');
const schema = new mongoose.Schema(
  {
    // 开始时间
    toc: {
      type: Date,
      index: 1,
    },
    // 结束时间
    tlm: {
      type: Date,
      default: null,
      index: 1,
    },
    // 处理人
    uid: {
      type: String,
      required: true,
    },
    // 处理内容的类型
    type: {
      type: String,
      enum: Object.values(sensitiveTypes),
      required: true,
      index: 1,
    },
    // 处理状态
    status: {
      type: String,
      enum: Object.values(sensitiveCheckerStatus),
      required: true,
      index: 1,
    },
    // 目标ID
    targetIds: {
      type: [String],
      default: [],
    },
    // 进度 保留以为小数 0.00 - 1.00
    progress: {
      type: Number,
      default: 0,
    },
    // 错误信息
    error: {
      type: String,
      default: '',
    },
  },
  {
    collection: collectionName,
  },
);

schema.methods.updateLogStatusToFailed = async function (error) {
  await this.updateOne({
    $set: {
      status: sensitiveCheckerStatus.failed,
      error,
      tlm: new Date(),
    },
  });
};

schema.methods.updateLogStatusToSucceeded = async function () {
  await this.updateOne({
    $set: {
      status: sensitiveCheckerStatus.succeeded,
      tlm: new Date(),
    },
  });
};

schema.methods.updateLogProgress = async function (
  progress = 0,
  addTargetIds = [],
) {
  await this.updateOne({
    $set: {
      status: sensitiveCheckerStatus.running,
      tlm: new Date(),
      progress,
    },
    $addToSet: {
      targetIds: {
        $each: addTargetIds,
      },
    },
  });
};

schema.statics.getLogById = async (logId) => {
  return await SensitiveCheckerLogModel.findOnly({
    _id: new mongoose.Types.ObjectId(logId),
  });
};

const SensitiveCheckerLogModel = mongoose.model(collectionName, schema);
module.exports = SensitiveCheckerLogModel;
