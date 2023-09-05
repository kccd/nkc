const mongoose = require('../settings/database');
const collectionName = 'activationCodes';
const schema = new mongoose.Schema(
  {
    _id: String,
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    used: {
      type: Boolean,
      default: false,
      index: 1,
    },
    // 激活码的来源，考试系统, 管理员等
    source: {
      type: String,
      required: true,
    },
    // 来源ID
    sid: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      default: '',
    },
    timeOfUse: {
      type: Date,
      default: null,
    },
    expiration: {
      type: Date,
      required: true,
    },
  },
  {
    collection: collectionName,
  },
);

module.exports = mongoose.model(collectionName, schema);
