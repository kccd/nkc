const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const originImageSchema = new Schema({
  originId: {
    type: String,
    default: ""
  },
  ext: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tpath: {
    type: String,
    default: ''
  },
  uid: {
    type: String,
    required: true,
    index: 1
  }
});

module.exports = mongoose.model('originImage', originImageSchema);