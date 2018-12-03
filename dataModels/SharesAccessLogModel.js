const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sharesAccessLogSchema = new Schema({
  ip: {
    type: String,
    index: 1,
    required: true
  },
  port: {
    type: String,
    required: true
  },
  token: {
    type: String,
    index: 1,
    required: true
  },
  uid: {
    type: String,
    default: '',
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  kcb: {
    type: Number,
    default: 0
  }
}, {
  collection: 'sharesAccessLogs'
});
const SharesAccessLogModel = mongoose.model('sharesAccessLogs', sharesAccessLogSchema);
module.exports = SharesAccessLogModel;