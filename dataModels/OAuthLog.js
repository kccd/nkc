const mongoose = require('../settings/database');
const collectionName = 'OAuthLogs';
const schema = mongoose.Schema({
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  token: {
    type: String,
    default: '',
    index: 1,
  },
  clientId: {
    type: String,
    required: true,
    index: 1,
  },
  operation: {
    type: String,
    required: true,
    index: 1
  },
}, {
  collection: collectionName,
});

module.exports = mongoose.model(collectionName, schema);
