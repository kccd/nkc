const mongoose = require('mongoose');
const collectionName = 'sensitiveSettings';
const {sensitiveSettingIds} = require('../settings/sensitiveSetting');

const schema = new mongoose.Schema({
  iid: {
    type: String,
    enum: Object.values(sensitiveSettingIds),
    index: 1,
    required: true,
  },
  enabled: {
    type: Boolean,
    required: true,
  },
  groupIds: {
    type: [String],
    default: [],
  },
  desc: {
    type: String,
    required: true,
  },
}, {
  collection: collectionName
});

module.exports = mongoose.model(collectionName, schema);