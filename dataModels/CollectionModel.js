const settings = require('../settings');
const ThreadModel = require('./ThreadModel');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let CollectionSchema = new Schema({
  cid: {
    type: Number,
    unique: true,
    required: true
  },
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
    default: 'unclassified',
    required: true
  }
});

CollectionSchema.methods.extendThread = async function(){
  const thread = await ThreadModel.findOnly({tid: this.tid});
  return Object.assign(thread.toObject(), {thread});
};

module.exports = mongoose.model('collections', CollectionSchema);