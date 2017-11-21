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

threadSchema.methods.ensurePermission = function (visibleFid) {
  return visibleFid.includes(this.fid);
};

threadSchema.methods.getPostByQuery = async function (query) {
  const PostModel = require('./PostModel');
  const {$match, $sort, $skip, $limit} = getQueryObj(query, {tid: this.tid});
  let posts = await PostModel.find($match).sort({toc: 1}).skip($skip).limit($limit);
  posts = await Promise.all(posts.map(p => p.extend()));
  return posts;
};

threadSchema.methods.getUser = async function() {
  const Usermodel = require('./UserModel');
  return await Usermodel.findOnly({uid: this.uid});
};

threadSchema.methods.updateMessage = async function() {
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

threadSchema.methods.getIndexOfPostId = async function () {
  const PostModel = require('./PostModel');
  return await PostModel.find({tid: this.tid}, {pid: 1}).sort({toc: 1});
};

module.exports = mongoose.model('threads', threadSchema);