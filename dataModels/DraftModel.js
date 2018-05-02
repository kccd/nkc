const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const draftSchema = new Schema({
  c: {
    type: String,
    default: 0
  },
  l: {
    type: String,
    default: 0
  },
  t: {
    type: String,
    default: 0
  },
  uid: {
    type: String,
    default: 0,
    index: 1
  },
  did: {
    type: String,
    default: 0,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  }
});


module.exports = mongoose.model('draft', draftSchema);