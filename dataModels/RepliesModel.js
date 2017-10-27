const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const repliesSchema = new Schema({
  fromPid: {
    type: String,
    required: true
  },
  toc: {
    type: Number,
    default: Date.now,
    index: 1
  },
  toPid: {
    type: String,
    required: true
  },
  toUid: {
    type: String,
    required: true,
    index: 1
  }
});


module.exports = mongoose.model('replies', repliesSchema);