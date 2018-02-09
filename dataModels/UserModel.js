const settings = require('../settings');
const {certificates} = settings.permission;
const mongoose = settings.database;
const Schema = mongoose.Schema;
const {indexUser, updateUser} = settings.elastic;

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
      unique: true,
      required: true,
      minlength: 1,
      maxlength: 30,
      trim: true
    },
    usernameLowerCase: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },
    uid: {
      type: String,
      unique: true,
      required: true,
    },
    cart: [String],
    description: String,
    color: String,
    certs: {
      type: [String],
      index: 1
    },
    postSign: String,
},
{toObject: {
  getters: true,
  virtuals: true
}});

userSchema.pre('save', function(next) {
  try {
    const certs = this.certs;
    const c = [];
    for (let cert of certs) {
      if (cert !== 'scholar') c.push(cert);
    }
    this.certs = c;
    return next()
  } catch(e) {
    return next(e)
  }
});

userSchema.virtual('regPort')
  .get(function() {
    return this._regPort;
  })
  .set(function(p) {
    this._regPort = p;
  });

userSchema.virtual('regIP')
  .get(function() {
    return this._regIP;
  })
  .set(function(ip) {
    this._regIP = ip;
  });

userSchema.virtual('mobile')
  .get(function() {
    return this._mobile;
  })
  .set(function(m) {
    this._mobile = m;
  });

userSchema.virtual('email')
  .get(function() {
    return this._email;
  })  
  .set(function(e) {
    this._email = e;
  });

userSchema.virtual('group')
  .get(function() {
    return this._group;
  })
  .set(function(g) {
    this._group = g;
  });

userSchema.virtual('threads')
  .get(function() {
    return this._threads;
  })
  .set(function(t) {
    this._threads = t;
  });

userSchema.methods.extendThreads = async function() {
  const ThreadModel = require('./ThreadModel');
  let threads = await ThreadModel.find({uid: this.uid, fid: {$ne: 'recycle'}}).sort({toc: -1}).limit(8);
  return this.threads = threads;
};

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
  this.regPort = userPersonal.regPort;
  this.regIP = userPersonal.regIP;
  this.mobile = userPersonal.mobile;
  this.email = userPersonal.email;
};

userSchema.methods.updateUserMessage = async function() {
  const PostModel = require('./PostModel');
  const ThreadModel = require('./ThreadModel');
  const uid = this.uid;
  const updateObj = {};
  updateObj.postCount = await PostModel.count({uid});
  updateObj.disabledPostsCount = await PostModel.count({uid, disabled: true});
  updateObj.threadCount = await ThreadModel.count({uid});
  updateObj.postCount = updateObj.postCount - updateObj.threadCount;
  updateObj.disabledThreadsCount = await ThreadModel.count({uid, disabled: true});
  updateObj.digestThreadsCount = await ThreadModel.count({uid, digest: true});
  updateObj.toppedThreadsCount = await ThreadModel.count({uid, topped: true});
  const recCount = await PostModel.aggregate([
    {
      $match: {
        uid,
        'recUsers.0': {$exists: 1}
      }
    },
    {
      $unwind: '$recUsers'
    },
    {
      $count: 'recCount'
    }
  ]);
  updateObj.recCount = recCount.length !== 0? recCount[0].recCount: 0;
  await this.update(updateObj);
};

userSchema.virtual('navbarDesc').get(function() {
  const {certs, username, xsf = 0, kcb = 0} = this;
  let cs = ['会员'];
  for(const cert of certs) {
    cs.push(certificates[cert].displayName);
  }
  cs = cs.join(' ');
  if(certs.includes('banned')){
    cs = '开除学籍';
  }
  return {
    username: username,
    xsf: xsf,
    kcb: kcb,
    cs: cs
  }
});

userSchema.pre('save', async function(next) {
  // handle the ElasticSearch index
  try {
    const {_initial_state_: initialState} = this;
    if (!initialState) { //this is a new user
      await indexUser(this);
      return next()
    } else if (initialState.description !== this.description) {
      // description has changed , update it in the es
      await updateUser(this);
      return next()
    } else {
      return next()
    }
  } catch(e) {
    return next(e)
  }
});

module.exports = mongoose.model('users', userSchema);