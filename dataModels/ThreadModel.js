const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const {getQueryObj} = require('../nkcModules/apiFunction');
const threadSchema = new Schema({
  tid: {
    type: String,
    unique: true,
    required:true
  },
  cid: {
    type: String,
    default:'',
    index: 1
  },
  count: {
    type: Number,
    default: 0
  },
  countRemain: {
    type: Number,
    default: 0
  },
  countToday: {
    type: Number,
    default: 0
  },
  digest: {
    type: Boolean,
    default: false,
    index: 1
  },
  digestInMid: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  fid: {
    type: String,
    required: true,
    index: 1
  },
  hideInMid: {
    type: Boolean,
    default: false
  },
  hits: {
    type: Number,
    default: 0
  },
  lm: {
    type: String,
    default: '',
    index: 1
  },
  mid: {
    type: String,
    required: true
  },
  oc: {
    type: String,
    default: '',
    index: 1
  },
  tlm: {
    type: Date,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  toMid: {
    type: String,
    default: ''
  },
  topped: {
    type: Boolean,
    default:false
  },
  toppedUsers: {
    type: [String],
    default: []
  },
  uid: {
    type: String,
    required: true,
    index: 1
  }
}, {toObject: {
  getters: true,
  virtuals: true
}});
threadSchema.pre('save', function (next) {
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  next();
});

threadSchema.virtual('firstPost')
  .get(function() {
    return this._firstPost
  })
  .set(function(p) {
    this._firstPost = p
  });

threadSchema.virtual('lastPost')
  .get(function() {
    return this._lastPost
  })
  .set(function(p) {
    this._lastPost = p
  });

threadSchema.virtual('forum')
  .get(function() {
    return this._forum
  })
  .set(function(f) {
    this._forum = f
  });

threadSchema.virtual('category')
  .get(function() {
    return this._category
  })
  .set(function(c) {
    this._category = c;
  });

threadSchema.virtual('user')
  .get(function() {
    return this._user
  })
  .set(function(u) {
    this._user = u;
  });

threadSchema.methods.extendFirstPost = async function() {
  const PostModel = require('./PostModel');
  return this.firstPost = await PostModel.findOnly({pid: this.oc})
};

threadSchema.methods.extendLastPost = async function() {
  const PostModel = require('./PostModel');
  return this.lastPost = await PostModel.findOnly({pid: this.lm})
};

threadSchema.methods.extendForum = async function() {
  const ForumModel = require('./ForumModel');
  return this.forum = await ForumModel.findOnly({fid: this.fid})
};

threadSchema.methods.extendCategory = async function() {
  const ThreadTypeModel = require('./ThreadTypeModel');
  return this.category = await ThreadTypeModel.findOnly({cid: this.cid});
};

threadSchema.methods.extendUser = async function() {
  const UserModel = require('./UserModel');
  return this.user = await UserModel.findOnly({uid: this.uid});
};

// 1、判断能否进入所在板块
// 2、判断所在帖子是否被禁
// 3、若所在帖子被禁则判断用户是否是该板块的版主或拥有比版主更高的权限
threadSchema.methods.ensurePermission = async function (ctx) {
  const visibleFid = await ctx.getVisibleFid();
  if(!visibleFid.includes(this.fid)) return false;
  if(this.disabled) {
    return await this.ensurePermissionOfModerators(ctx);
  } else {
    return true;
  }
};

// 判断用户是否是该板块的版主或拥有比版主更高的权限
threadSchema.methods.ensurePermissionOfModerators = async function(ctx) {
  if(ctx.data.userLevel > 4) {
    return true;
  } else {
    const forum = await ctx.db.ForumModel.findOnly({fid: this.fid});
    return ctx.data.user && forum.moderators.includes(ctx.data.user.uid);
  }
};

threadSchema.methods.getPostByQuery = async function (query, macth) {
  const PostModel = require('./PostModel');
  const {$match, $sort, $skip, $limit} = getQueryObj(query, macth);
  let posts = await PostModel.find($match)
    .sort({toc: 1}).skip($skip).limit($limit);
  await Promise.all(posts.map(async doc => {
    await doc.extendUser();
    await doc.extendResources();
  }));
  return posts;
};


threadSchema.methods.updateThreadMessage = async function() {
  const PostModel = require('./PostModel');
  const timeToNow = new Date();
  const time = new Date(`${timeToNow.getFullYear()}-${timeToNow.getMonth()+1}-${timeToNow.getDate()}`);
  const t2 = Date.now();
  const updateObj = {};
  const lm = await PostModel.findOne({tid: this.tid}).sort({toc: -1});
  const oc = await PostModel.findOne({tid: this.tid}).sort({toc: 1});
  updateObj.tlm = lm.toc;
  updateObj.toc = oc.toc;
  updateObj.lm = lm.pid;
  updateObj.oc = oc.pid;
  updateObj.count = await PostModel.count({tid: this.tid});
  updateObj.countToday = await PostModel.count({tid: this.tid, toc: {$gt: time}});
  updateObj.countRemain = await PostModel.count({tid: this.tid, disabled: {$ne: true}});
  updateObj.uid = oc.uid;
  await this.update(updateObj);
  const t25 = Date.now();
  const forum = await this.extendForum();
  await forum.updateForumMessage();
  const t3 = Date.now();
  const user = await this.extendUser();
  await user.updateUserMessage();
};

threadSchema.methods.newPost = async function(post, user, ip) {
  const SettingModel = require('./SettingModel');
  const UsersPersonalModel = require('./UsersPersonalModel');
  const PostModel = require('./PostModel');
  const UserModel = require('./UserModel');
  const ReplyModel = require('./ReplyModel');
  const dbFn = require('../nkcModules/dbFunction');
  const pid = await SettingModel.operateSystemID('posts', 1);
  const {c, t, l} = post;
  const quote = await dbFn.getQuote(c);
  if(this.uid !== user.uid) {
    const replyWriteOfThread = new ReplyModel({
      fromPid: pid,
      toPid: this.oc,
      toUid: this.uid
    });
    await replyWriteOfThread.save();
  }
  let rpid = '';
  if(quote && quote[2]) {
    rpid = quote[2];
  }
  const _post = await new PostModel({
    pid,
    c,
    t,
    ipoc: ip,
    iplm: ip,
    l,
    fid: this.fid,
    tid: this.tid,
    uid: user.uid,
    uidlm: user.uid,
    rpid
  });
  await _post.save();
  await this.update({
    lm: pid,
    tlm: Date.now()
  });
  if(quote && quote[2] !== this.oc) {
    const username = quote[1];
    const quPid = quote[2];
    const quUser = await UserModel.findOne({username});
    const quPost = await PostModel.findOne({pid: quPid});
    if(quUser && quPost) {
      const reply = new ReplyModel({
        fromPid: pid,
        toPid: quPid,
        toUid: quUser.uid
      });
      await reply.save();
    }
  }
  await this.update({lm: pid});
  return _post
};
 // 算post所在楼层
threadSchema.methods.getStep = async function(obj) {
  const PostModel = require('./PostModel');
  const {perpage} = require('../settings').paging;
  const pid = obj.pid;
  const q = {
    tid: this.tid
  };
  if(obj.disabled === false) q.disabled = false;
  const posts = await PostModel.find(q, {pid: 1, _id: 0}).sort({toc: 1});
  let page, step;
  for (let i = 0; i < posts.length; i++) {
    if(posts[i].pid !== pid) continue;
    page = Math.ceil((i+1)/perpage) - 1;
    if(page < 0) page = 0;
    step = i;
    break;
  }
  return {
    page,// 页数
    step // 楼层
  }
};

module.exports = mongoose.model('threads', threadSchema);