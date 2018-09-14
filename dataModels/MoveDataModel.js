const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  toc: {
    type: Date,
    required: true,
    index: 1
  },
  type: {
    type: String,
    required: true,
    index: 1
  },
  tid: String,
  targetTid: String,
  pid: String,
  targetPid: String,
  uid: String,
  targetUid: String,

}, {
  collection: 'moveData'
});

module.exports = mongoose.model('moveData', schema);






