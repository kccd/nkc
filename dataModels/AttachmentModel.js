const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: String,
  type: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    default: '',
    index: 1,
  },
  path: {
    type: String,
    required: true,
    index: 1,
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: 'attachments'
});

module.exports = mongoose.model('attachments', schema);
