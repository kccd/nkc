const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const SmsSchema = new Schema({
  c: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    default: '0.0.0.0'
  },
  r: {
    type: String,
    default: '',
    index: 1
  },
  s: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Number,
    default: Date.now
  },
  viewed: {
    type: Boolean,
    default: false
  }
});
module.exports = mongoose.model('sms', SmsSchema);