const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  did: {
    type: String,
    required: true,
    index: 1
  }
}, {
  collection: 'comments'
});
module.exports = mongoose.model('comments', schema);