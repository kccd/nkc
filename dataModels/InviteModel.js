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

inviteSchema.virtual('post')
  .get(function() {
    if(!this._post) {
      throw new Error('post is not initialized.');
    }
    return this._post;
  })
  .set(function(t) {
    this._post = t;
  });

inviteSchema.virtual('user')
  .get(function() {
    if(!this._user) {
      throw new Error('user is not initialized.');
    }
    return this._user;
  })
  .set(function(u) {
    this._user = u;
  });


inviteSchema.methods.extendPost = async function() {
  const PostModel = require('./PostModel');
  const post = await PostModel.findOnly({pid: this.pid});
  await post.extendThread().then(t => t.extendFirstPost());
  return this.post = post;
};

inviteSchema.methods.extendUser = async function() {
  const UserModel = require('./UserModel');
  const user = await UserModel.findOnly({uid: this.inviter});
  return this.user = user;
};

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