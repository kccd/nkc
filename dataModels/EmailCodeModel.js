const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const emailCodeSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now
  },
  email: {
    type: String,
    match: /.*@.*/,
    required: true,
    index: 1
  },
  token: {
    type: String,
    required: true,
    index: 1
  },
  used: {
    type: Boolean,
    default: false
  },
  uid: {
    type: String,
    required: true
  }
});
module.exports = mongoose.model('emailCodes', emailCodeSchema, 'emailCodes');