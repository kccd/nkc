const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let CollectionSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now,
    index: 1
  },
  tid: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  category: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('collections', CollectionSchema);