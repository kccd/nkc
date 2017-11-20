const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const repliesSchema = new Schema({
  fromPid: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  toPid: {
    type: String,
    required: true
  },
  toUid: {
    type: String,
    required: true,
    index: 1
  },
  /*viewed: {
    type: Boolean,
    default: false,
  }*/
});

repliesSchema.methods.extend = async function() {
  const UserModel = require('./UserModel');
  const PostModel = require('./PostModel');
  const fromPost = await PostModel.findOnly({pid: this.fromPid});
  const toPost = await PostModel.findOnly({pid: this.toPid});
  const fromUser = await UserModel.findOnly({uid: fromPost.uid});
  return Object.assign(this.toObject(), {fromPost, toPost, fromUser});
};

repliesSchema.methods.view = async function() {
  return await this.update({viewed: true});
};


module.exports = mongoose.model('replies', repliesSchema);