const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const {getQueryObj} = require('../nkcModules/apiFunction');
const PostModel = require('./PostModel');
const ForumModel = require('./ForumModel');
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
    default: false
  },
  digestInMid: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  esi: {
    type: Boolean,
    default: false
  },
  fid: {
    type: String,
    required: true
  },
  hasFile: {
    type: Boolean,
    default: false
  },
  hasImage: {
    type: Boolean,
    default: false
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
  },
  toc: {
    type: Date,
    default: Date.now
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
    required: true
  }
});
threadSchema.pre('save', function (next) {
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  next();
});

threadSchema.methods.extend = async function (){
  let obj = this.toObject();
  let oc = await PostModel.findOnly({pid: this.oc});
  let lm = await PostModel.findOnly({pid: this.lm});
  let forum = await ForumModel.findOnly({fid: this.fid});
  obj.oc = await oc.extend();
  obj.lm = await lm.extend();
  obj.forum = forum;
  return obj;
};

threadSchema.methods.getPostByQuery = async function (query) {
  const {$match, $sort, $skip, $limit} = getQueryObj(query, {tid: this.tid});
  let posts = await PostModel.find($match).sort({toc: 1}).skip($skip).limit($limit);
  posts = await Promise.all(posts.map(p => p.extend()));
  return posts;
};

module.exports = mongoose.model('threads', threadSchema);