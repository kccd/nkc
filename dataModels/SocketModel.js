const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const socketSchema = new Schema({
  toc: {
    type: Date,
    default: 1,
    index: 1
  },
  socketId: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  processId: {
    type: String,
    required: true,
    index: 1
  }
}, {
  collection: 'sockets'
});
const SocketModel = mongoose.model('sockets', socketSchema);
module.exports = SocketModel;