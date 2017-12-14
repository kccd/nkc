const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
	rid: {
    type: String,
    unique: true,
    required: true
  },
  ext: {
    type: String,
    default: ''
  },
  hits: {
    type: Number,
    default: 0
  },
  oname: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('resources', resourceSchema);