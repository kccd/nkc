const mongoose = require('../settings/database');

const collectionName = 'fundOperations';

const schema = new mongoose.Schema(
  {
    toc: {
      type: Date,
      required: true,
      index: 1,
    },
    // 基金申请表ID
    formId: {
      type: Number,
      required: true,
      index: 1,
    },
    // 操作人
    uid: {
      type: String,
      required: true,
    },
    // 操作类型
    type: {
      type: String,
      required: true,
    },

    // 操作说明、或者审核理由等用户输入的内容
    desc: {
      type: String,
      default: '',
    },

    // 拨款的期数
    // 拨款操作时有效
    installment: {
      type: Number,
      default: 0,
    },

    // 金额数字，拨款金额、退款金额
    money: {
      type: Number,
      default: 0,
    },

    // 数据的状态：被屏蔽、被删除、正常
    status: {
      type: String,
      required: true,
      index: 1,
    },
  },
  {
    collection: collectionName,
  },
);

module.exports = mongoose.model(collectionName, schema);
