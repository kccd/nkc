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
    default:''
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
    default: ''
  },
  mid: {
    type: String,
    required: true
  },
  oc: {
    type: String,
    default: ''
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

threadSchema.methods.extendFirstPost = async function() {
  const PostModel = require('./PostModel');
  return this.firstPost = await PostModel.findOnly({pid: this.oc})
};

threadSchema.methods.extendLastPost = async function() {
  const PostModel = require('./PostModel');
  return this.lastPost = await PostModel.findOnly({pid: this.lm})
};

threadSchema.methods.extendForum = function() {
  const ForumModel = require('./ForumModel');
  return this.forum = ForumModel.findOnly({fid: this.fid})
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

threadSchema.methods.getUser = async function() {
  const Usermodel = require('./UserModel');
  return await Usermodel.findOnly({uid: this.uid});
};

threadSchema.methods.updateThreadMessage = async function() {
  const PostModel = require('./PostModel');
  const ResourceModel = require('./ResourceModel');
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
    hasImage: this.hasImage,
    hasFile: this.hasFile,
    tlm: lastPost.toc.getTime(),
    count: count,
    countRemain: countRemain,
    countToday: countToday,
    oc: firstPost.pid,
    lm: lastPost.pid,
    toc: firstPost.toc.getTime(),
    uid: firstPost.uid
  };
  if(firstPost.r) {
    let r = firstPost.r;
    const extArr = ['jpg', 'png', 'svg', 'jpeg'];
    let imageNum = 0;
    for (let i = 0; i < r.length; r++) {
      const rFromDB = await ResourceModel.findOne({rid: r[i]});
      if(extArr.includes(rFromDB.ext)) {
        imageNum++;
        updateObj.hasImage = true;
      }
    }
    if(r.length > imageNum) updateObj.hasFile = true;
  }
  return await this.update(updateObj);
};

threadSchema.methods.newPost = async function(post, user, ip) {
  const SettingModel = require('./SettingModel');
  const UsersPersonalModel = require('./UsersPersonalModel');
  const PostModel = require('./PostModel');
  const UserModel = require('./UserModel');
  const InviteModel = require('./InviteModel');
  const pid = await SettingModel.operateSystemID('posts', 1);
  const {c, t, l} = post;
  //handle at someone
  const atUsers = []; //user info {username, uid}
  const existedUsers = []; //real User mongoose data model
  const r = (c.match(/{r=[0-9]{1,20}}/g) || [])
    .map(str => str.replace(/{r=([0-9]{1,20})}/, '$1'));
  const matchedUsernames = c.match(/@([^@\s]*)\s/g);
  if(matchedUsernames) {
    await Promise.all(matchedUsernames.map(async str => {
      const username = str.slice(1, -1); //slice the @ and [\s] in reg
      const users = await UserModel.findOne({username});
      if(users.length !== 0) {
        const user = users[0];
        const {username, uid} = user;
        let flag = true; //which means this user does not in existedUsers[]
        for(const u of atUsers) {
          if(u.username === username)
            flag = false;
        }
        if(flag) {
          atUsers.push({username, uid});
          existedUsers.push(user)
        }
      }
    }))
  }
  await Promise.all(atUsers.map(foundUser => new InviteModel({
    pid,
    invitee: foundUser.uid,
    inviter: user.uid,
  })));
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
    uidlm: user.uid
  });
  await _post.save();
  await Promise.all(existedUsers.map(async u => {
    const up = await UsersPersonalModel.findOnly({uid: u.uid});
    await up.increasePsnl('at');
  }));
  await this.update({lm: pid});
  return _post
};

module.exports = mongoose.model('threads', threadSchema);