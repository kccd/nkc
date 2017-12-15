const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
smsCodeSchema = new Schema({
  toc: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    index: 1
  },
  mobile: {
    type: String,
    required: true,
    index: 1
  },
  used: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('smsCodes', smsCodeSchema, 'smsCodes');