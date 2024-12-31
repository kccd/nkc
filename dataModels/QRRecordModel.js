const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  toc: {
    type: Date,
    default: Date.now,
  },
  uid: {
    type: String,
    default: '',
  },
  scanTime: {
    type: Date,
    default: null,
  },
  agreeTime: {
    type: Date,
    default: null,
  },
  scan: {
    type: Boolean,
    default: false,
  },
  agree: {
    type: Boolean,
    default: false,
  },
  timeout: {
    type: Boolean,
    default: false,
  },
  webIp: {
    type: String,
    default: '',
  },
  webPort: {
    type: Number,
    default: 0,
  },
  scanIp: {
    type: String,
    default: '',
  },
  scanPort: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('QRRecords', schema);
