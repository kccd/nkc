const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let inviteSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now(),
    index: 1
  },
  pid: {
    type: String,
    required: true,
    index: 1
  },
  invitee: {
    type: String,
    required: true,
    index: 1
  },
  inviter: {
    type: String,
    required: true,
    index: 1
  }
});

module.exports = mongoose.model('invites', inviteSchema);