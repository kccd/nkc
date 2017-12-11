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
  }
},
{toObject: {
  getters: true,
  virtuals: true
}});

repliesSchema.virtual('fromPost')
  .get(function() {
    return this._fromPost;
  })
  .set(function(p) {
    this._fromPost = p;
  });

repliesSchema.virtual('toPost')
  .get(function() {
    return this._toPost;
  })
  .set(function(p) {
    this._toPost = p;
  });

repliesSchema.methods.extendFromPost = async function() {
  const PostModel = require('./PostModel');
  const fromPost = await PostModel.findOnly({pid: this.fromPid});
  return this.fromPost = fromPost;
};

repliesSchema.methods.extendToPost = async function() {
  const PostModel = require('./PostModel');
  const toPost = await PostModel.findOnly({pid: this.toPid});
  return this.toPost = toPost;
};


repliesSchema.methods.view = async function() {
  return await this.update({viewed: true});
};


module.exports = mongoose.model('replies', repliesSchema);