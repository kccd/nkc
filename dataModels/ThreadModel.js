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
  category: {
    type: String,
    default: ''
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
  esi: {
    type: Boolean,
    default: false
  },
  fid: {
    type: String,
    required: true,
    index: 1
  },
  hasFile: {
    type: Boolean,
    default: false
  },
  hasImage: {
    type: Boolean,
    default: false,
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
});
threadSchema.pre('save', function (next) {
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  next();
});

threadSchema.methods.extend = async function (){
  const PostModel = require('./PostModel');
  const ForumModel = require('./ForumModel');
  let obj = this.toObject();
  let oc = await PostModel.findOnly({pid: this.oc});
  let lm = await PostModel.findOnly({pid: this.lm});
  let forum = await ForumModel.findOnly({fid: this.fid});
  obj.oc = await oc.extend();
  obj.lm = await lm.extend();
  obj.forum = forum;
  return obj;
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
  let posts = await PostModel.find($match).sort({toc: 1}).skip($skip).limit($limit);
  posts = await Promise.all(posts.map(p => p.extend()));
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



module.exports = mongoose.model('threads', threadSchema);