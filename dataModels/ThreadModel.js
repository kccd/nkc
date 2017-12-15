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
  const posts = await PostModel.find({tid: this.tid}).sort({toc: -1});
  const count = posts.length;
  if(count === 0) return;
  const timeToNow = new Date();
  const time = new Date(`${timeToNow.getFullYear()}-${timeToNow.getMonth()+1}-${timeToNow.getDate()}`);
  let countToday = 0;
  let countRemain = 0;
  posts.map(post => {
    if(post.toc > time) countToday++;
    if(!post.disabled) countRemain++;
  });
  const lastPost = posts[0];
  const firstPost = posts[posts.length-1];
  const updateObj = {
    tlm: lastPost.toc,
    count: count,
    countRemain: countRemain,
    countToday: countToday,
    oc: firstPost.pid,
    lm: lastPost.pid,
    toc: firstPost.toc,
    uid: firstPost.uid
  };
  const t1 = Date.now();
  await this.update(updateObj);
  const t2 = Date.now();
  const forum = await this.extendForum();
  await forum.updateForumMessage();
  const t3 = Date.now();
  const user = await this.extendUser();
  await user.updateUserMessage();
  console.log(`更新帖子：${t2-t1}ms, 更新板块：${t3-t2}ms, 更新用户：${Date.now()-t3}ms`);
};

threadSchema.methods.newPost = async function(post, user, ip) {
  const SettingModel = require('./SettingModel');
  const UsersPersonalModel = require('./UsersPersonalModel');
  const PostModel = require('./PostModel');
  const UserModel = require('./UserModel');
  const InviteModel = require('./InviteModel');
  const RepliesModel = require('./RepliesModel');
  const dbFn = require('../nkcModules/dbFunction');
  const pid = await SettingModel.operateSystemID('posts', 1);
  const {c, t, l} = post;
  //handle at someone
  const {atUsers, existedUsers, r, quote} = await dbFn.getArrayForAtResourceAndQuote(c);
  await Promise.all(atUsers.map(foundUser => {
    const at = new InviteModel({
      pid,
      invitee: foundUser.uid,
      inviter: user.uid,
    });
    return at.save();
  }));
  // 如果回复别人的帖子则提醒
  if(this.uid !== user.uid) {
    const replyWriteOfThread = new RepliesModel({
      fromPid: pid,
      toPid: this.oc,
      toUid: this.uid
    });
    const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
    await userPersonal.increasePsnl('replies', 1);
    await replyWriteOfThread.save();
  }
  let rpid = '';
  if(quote && quote[2]) {
    rpid = quote[2];
  }
  const _post = await new PostModel({
    pid,
    atUsers,
    c,
    t,
    ipoc: ip,
    iplm: ip,
    l,
    r,
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
  await Promise.all(existedUsers.map(async u => {
    const up = await UsersPersonalModel.findOnly({uid: u.uid});
    await up.increasePsnl('at', 1);
  }));
  if(quote && quote[2] !== this.oc) {
    const username = quote[1];
    const quPid = quote[2];
    const quUser = await UserModel.findOne({username});
    const quPost = await PostModel.findOne({pid: quPid});
    if(quUser && quPost) {
      const quUserPersonal = await UsersPersonalModel.findOnly({uid: quUser.uid});
      const reply = new RepliesModel({
        fromPid: pid,
        toPid: quPid,
        toUid: quUser.uid
      });
      await reply.save();
      await quUserPersonal.increasePsnl('replies', 1);
    }
  }
  await this.update({lm: pid});
  return _post
};

module.exports = mongoose.model('threads', threadSchema);