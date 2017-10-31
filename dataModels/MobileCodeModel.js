const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
mobileCodeSchema = new Schema({
  mobile: {
    type: String,
    unique: true,
    required: true
  },
  toc: {
    type: Number,
    default: Date.now
  },
  uid: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model('mobileCodes', mobileCodeSchema, 'mobileCodes');