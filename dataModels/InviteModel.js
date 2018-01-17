const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let inviteSchema = new Schema({
  toc: {
    type: Date,
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
},
{toObject: {
  getters: true,
  virtuals: true
}});

inviteSchema.virtual('post')
  .get(function() {
    return this._post;
  })
  .set(function(t) {
    this._post = t;
  });

inviteSchema.virtual('user')
  .get(function() {
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

inviteSchema.post('save', async function(doc, next) {
  // should increase the invitee's un-read notification

  try {
    const UsersPersonalModel = mongoose.model('usersPersonal');

    const uid = doc.invitee;
    const inviteePersonal = await UsersPersonalModel.findOnly({uid});
    await inviteePersonal.increasePsnl('at', 1);
    return next()
  } catch(e) {
    return next(e)
  }
});

module.exports = mongoose.model('invites', inviteSchema);