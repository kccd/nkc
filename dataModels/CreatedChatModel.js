const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({

  _id: Number,

  uid: {
    type: String,
    index: 1,
    required: true
  },
  tUid: {
    type: String,
    index: 1,
    required: true
  },
  // last message id
  lmId: {
    type: Number,
    default: null
  },
  toc: {
    type: Date,
    index: 1,
    default: Date.now
  },
  tlm: {
    type: Date,
    index: 1
  },
  total: {
    type: Number,
    default: 0
  },
  unread: {
    type: Number,
    default: 0
  }
}, {
  collection: 'createdChat'
});

chatSchema.pre('save', function(next) {
  if(!this.tlm) this.tlm = this.toc;
  next();
});


const CreatedChatModel = mongoose.model('createdChat', chatSchema);

module.exports = CreatedChatModel;