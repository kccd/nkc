const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
	rid: {
    unique: true,
    type: String,
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
  pid: {
    type: String,
    default: '' 
  },
  size: {
    type: Number,
    default: 0
  },
  toc: {
    type: Number,
    default: Date.now
  },
  tpath: {
    type: String,
    default: ''
  },
  uid: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('resources', resourceSchema);