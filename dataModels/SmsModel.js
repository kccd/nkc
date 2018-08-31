const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const SmsSchema = new Schema({
  sid: {
    type: Number,
    required: true
  },
  c: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: '0.0.0.0'
  },
  port: {
    type: String,
    default: '0'
  },
  r: {
    type: String,
    default: '',
    index: 1
  },
  s: {
    type: String,
    default: '',
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now
  },
  viewed: {
    type: Boolean,
    default: false
  },
  fromSystem: {
    type: Boolean,
    default: false,
    index: 1
  },
  systemContent: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  },
  viewedUsers: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('sms', SmsSchema);