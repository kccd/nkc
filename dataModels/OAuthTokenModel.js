const mongoose = require('../settings/database');
const collectionName = 'OAuthTokens';
const tokenStatus = {
  normal: 'normal',
  used: 'used',
  timeout: 'timeout'
};
const schema = mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: 1,
  },
  toc: {
    type: Date,
    default: Date.now,
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
    index: 1,
  },
  used: {
    type: Boolean,
    default: false,
    index: 1,
  },
  status: {
    type: String,
    default: tokenStatus.normal,
    index: 1,
  }
}, {
  collection: collectionName,
});

module.exports = mongoose.model(collectionName, schema);
