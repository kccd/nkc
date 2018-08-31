const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageFileSchema = new Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  targetUid: {
    type: String,
    required: true,
    index: 1
  },
  path: {
    type: String,
    required: true
  },
  oname: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  ext: {
    type: 'String',
    required: true
  },
  hits: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: 'messageFiles',
  toObject: {
    getters: true,
    virtuals: true
  }
});

const messageFileModel = mongoose.model('messageFiles', messageFileSchema);
module.exports = messageFileModel;