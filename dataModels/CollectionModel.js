const settings = require('../settings');
const ThreadModel = require('./ThreadModel');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let CollectionSchema = new Schema({
  cid: {
    type: String,
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
    default: '未分类',
    required: true,
    index: 1
  }
},
{toObject: {
  getters: true,
  virtuals: true
}});

CollectionSchema.virtual('thread')
  .get(function() {
    return this._thread;
  })
  .set(function(t) {
    this._thread = t;
  });

CollectionSchema.methods.extendThread = async function() {
  const targetThread = await ThreadModel.findOnly({tid: this.tid});
  await targetThread.extendFirstPost().then(p => p.extendUser());
  await targetThread.extendLastPost().then(p => p.extendUser());
  return this.thread = targetThread;
};

CollectionSchema.methods.delete = async function() {
  const CollectionModel = require('./CollectionModel');
  return await CollectionModel.deleteOne({cid: this.cid});
};

module.exports = mongoose.model('collections', CollectionSchema);