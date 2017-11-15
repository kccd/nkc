const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const userSchema = new Schema({
  kcb: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now
  },
  xsf: {
    type: Number,
    default: 0
  },
  tlv: {
    type: Date,
    default: Date.now,
  },
  disabledPostsCount: {
    type: Number,
    default: 0
  },
  disabledThreadsCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  threadCount: {
    type: Number,
    default: 0
  },
  subs: {
    type: Number,
    default: 0
  },
  recCount: {
    type: Number,
    default: 0
  },
  toppedThreadsCount: {
    type: Number,
    default: 0
  },
  digestThreadsCount: {
    type: Number,
    default: 0,
  },
  score: {
    default: 0,
    type: Number
  },
  lastVisitSelf: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
    unique: true
  },
  usernameLowerCase: {
    type: String,
    unique: true
  },
  uid: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  bday: String,
  cart: [String],
  email: {
    type: String,
    match: /.*@.*/
  },
  description: String,
  color: String,
  certs: {
    type: [String],
    index: 1
  },
  introText: String,
  postSign: String,
});
userSchema.pre('save', function(next) {
  if(!this.usernameLowerCase)
    this.usernameLowerCase = this.username.toLowerCase();
  next()
});
userSchema.methods.getUsersThreads = async function() {
  const ThreadModel = require('./ThreadModel');
  let threads = await ThreadModel.find({uid: this.uid, fid: {$ne: 'recycle'}}).sort({toc: -1}).limit(8);
  threads = await Promise.all(threads.map(t => t.extend()));
  return threads;
};

module.exports = mongoose.model('users', userSchema);