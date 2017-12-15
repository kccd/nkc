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
      maxlength: 30
    },
    usernameLowerCase: {
      type: String,
      unique: true
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
  if(!this.usernameLowerCase){
    this.usernameLowerCase = this.username.toLowerCase();
  }
  const certs = this.certs;
  const c = [];
  for (let cert of certs) {
    if(cert !== 'qc') c.push(cert);
  }
  this.certs = c;
  next()
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
  const t1 = Date.now();
  const posts = await PostModel.find({uid: this.uid}, {_id: 0, disabled: 1, recUsers: 1});
  const postCount = posts.length;
  let recCount = 0;
  for (let post of posts) {
    try{
      recCount += post.recUsers.length;
    } catch(err) {
      return console.log(post);
    }
  }
  const t2 = Date.now();
  const threads = await ThreadModel.find({uid: this.uid}, {_id: 0,count: 1, countRemain: 1,  disabled: 1, digest: 1, topped: 1});
  const threadCount = threads.length;
  let disabledThreadsCount = 0;
  let digestThreadsCount = 0;
  let toppedThreadsCount = 0;
  let disabledPostsCount = 0;
  for (let thread of threads) {
    if(thread.disabled || thread.fid === 'recycle') disabledThreadsCount++;
    if(thread.digest) digestThreadsCount++;
    if(thread.topped) toppedThreadsCount++;
    disabledPostsCount += (thread.count - thread.countRemain);
  }
  const oldDate = {
    postCount,
    disabledPostsCount: disabledPostsCount,
    threadCount,
    disabledThreadsCount,
    digestThreadsCount,
    toppedThreadsCount,
    recCount
  };
  console.log(oldDate)
  await this.update(oldDate);
  const t3 = Date.now();
  console.log(`posts: ${t2-t1}ms, thread: ${t3-t2}`);
  const updateObj = {};
  const dataObj = await PostModel.aggregate([
    {
      $match: {
        uid: this.uid
      }
    },
    {
      $group: {
        _id: '$uid',
        postCount: {$sum: 1},
        child: {$push: '$$ROOT'},
        recCount: {$sum: {$size: '$recUsers'}}
      }
    },
    {
      $unwind: '$child'
    },
    {
      $match: {
        'child.disabled': true
      }
    },
    {
      $group: {
        _id: '$child.disable',
        postCount: {$push: '$postCount'},
        recCount: {$push: '$recCount'},
        disabledPostsCount: {$sum: 1}
      }
    },
    {
      $unwind: '$postCount'
    },
    {
      $limit: 1
    },
    {
      $unwind: '$recCount'
    },
    {
      $limit: 1
    },
  ]);
  updateObj.postCount = dataObj[0].postCount;
  updateObj.disabledPostsCount = dataObj[0].disabledPostsCount;
  updateObj.recCount = dataObj[0].recCount;
  const t4 = Date.now();
  updateObj.postCount = await PostModel.count({uid: this.uid});
  updateObj.disabledPostsCount = await PostModel.count({uid: this.uid, disabled: true});
  updateObj.threadCount = await ThreadModel.count({uid: this.uid});
  updateObj.disabledThreadsCount = await ThreadModel.count({uid: this.uid, disabled: true});
  updateObj.digestThreadsCount = await ThreadModel.count({uid: this.uid, digest: true});
  updateObj.toppedThreadsCount = await ThreadModel.count({uid: this.uid, topped: true});
  const t5 = Date.now();
  console.log(updateObj);
  await this.update(updateObj);
  console.log(`all: ${t4-t3}ms`);
  console.log(t5-t4 + 'ms');
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

module.exports = mongoose.model('users', userSchema);