const settings = require('../settings');
const {certificates} = settings.permission;
const mongoose = settings.database;
const Schema = mongoose.Schema;
const userSchema = new Schema({
  kcb: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
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
  threads = await Promise.all(threads.map(async t => {
    await t.extendForum();
    await t.extendFirstPost().then(p => p.extendUser());
    await t.extendLastPost().then(p => p.extendUser());
    return t;
  }));
  return threads;
};

userSchema.methods.extend = async function() {
  const UsersPersonalModel = require('./UsersPersonalModel');
  const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
  const user = this.toObject();
  user.regPort = userPersonal.regPort;
  user.regIP = userPersonal.regIP;
  user.mobile = userPersonal.mobile;
  user.email = userPersonal.email;
  return user;
};

userSchema.methods.updateUserMessage = async function() {
  const PostModel = require('./PostModel');
  const ThreadModel = require('./ThreadModel');
  const UsersSubscribeModel = require('./UsersSubscribeModel');
  const posts = await PostModel.find({uid: this.uid}, {_id: 0, disabled: 1, recUsers: 1});
  const postCount = posts.length;
  let disabledPostCount = 0;
  let recCount = 0;
  for (let post of posts) {
    try{
      recCount += post.recUsers.length;
    } catch(err) {
      return console.log(post);
    }
    if(post.disabled) disabledPostCount++;
  }
  const threads = await ThreadModel.find({uid: this.uid}, {_id: 0, disabled: 1, digest: 1, topped: 1});
  const threadCount = threads.length;
  let disabledThreadCount = 0;
  let digestThreadsCount = 0;
  let toppedThreadsCount = 0;
  for (let thread of threads) {
    if(thread.disabled) disabledThreadCount++;
    if(thread.digest) digestThreadsCount++;
    if(thread.topped) toppedThreadsCount++;
  }
  const userSubscribe = await UsersSubscribeModel.findOnly({uid: this.uid});
  const subs = userSubscribe.subscribers.length;
  await this.update({
    postCount,
    disabledPostCount,
    threadCount,
    disabledThreadCount,
    digestThreadsCount,
    toppedThreadsCount,
    subs,
    recCount
  });
};

userSchema.virtual('navbarDesc').get(function() {
  const {certs, username, xsf = 0, kcb = 0} = this;
  let cs = ['会员'];
  for(const cert of certs) {
    cs.push(certificates[cert].displayName);
  }
  cs = cs.join(' ');
  return {
    username: username,
    xsf: xsf,
    kcb: kcb,
    cs: cs
  }
});

module.exports = mongoose.model('users', userSchema);