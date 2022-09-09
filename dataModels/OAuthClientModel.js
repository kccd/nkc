const mongoose = require('../settings/database');
const collectionName = 'OAuthClients';
const clientStatus = {
  normal: 'normal', // 正常
  disabled: 'disabled', // 被屏蔽
  deleted: 'deleted', // 被删除
  unknown: 'unknown', // 待审核
};

const schema = mongoose.Schema({
  _id: String,
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: ''
  },
  desc: {
    type: String,
    default: '',
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1,
  },
  secret: {
    type: String,
    required: true,
    index: 1,
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  status: {
    type: String,
    default: clientStatus.unknown,
    index: 1
  }
}, {
  collection: collectionName
});

module.exports = mongoose.model(collectionName, schema);
