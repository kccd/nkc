const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const socketSchema = new Schema({
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  uid: {
    type: String,
    unique: true,
    required: true
  },
  targetUid: {
    type: String,
    default: '',
    index: 1
  }
}, {
  collection: 'sockets'
});
const SocketModel = mongoose.model('sockets', socketSchema);
module.exports = SocketModel;