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

inviteSchema.methods.extend = async function() {
  const PostModel = require('./PostModel');
  const ThreadModel = require('./ThreadModel');
  const UserModel = require('./UserModel');
  const post = await PostModel.findOnly({pid: this.pid});
  const user = await UserModel.findOnly({uid: this.inviter});
  const thread = await ThreadModel.findOnly({tid: post.tid});
  const oc = await PostModel.findOnly({pid: thread.oc});
  return {at: this, post, user, thread, oc}
};

module.exports = mongoose.model('invites', inviteSchema);