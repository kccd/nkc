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
    required: true,
    index: 1
  }
});

CollectionSchema.methods.extend = async function() {
  const targetThread = await ThreadModel.findOnly({tid: this.tid});
  const thread = await targetThread.extend();
  return Object.assign(this.toObject(), {thread});
};

CollectionSchema.methods.delete = async function() {
  const CollectionModel = require('./CollectionModel');
  return await CollectionModel.deleteOne({cid: this.cid});
};

module.exports = mongoose.model('collections', CollectionSchema);