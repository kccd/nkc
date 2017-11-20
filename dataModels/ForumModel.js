const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const {getQueryObj} = require('../nkcModules/apiFunction');

const forumSchema = new Schema({
	abbr: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'grey'
  },
  countPosts: {
    type: Number,
    default: 0
  },
  countThreads: {
    type: Number,
    default: 0
  },
  countPostsToday: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: ''
  },
  displayName: {
    type: String,
    required: true,
  },
  iconFileName: {
    type: String,
    default: ''
  },
  isVisibleForNCC: {
    type: Boolean,
    default: false
  },
  moderators: {
    type: Array,
    default: []
  },
  order: {
    type: Number,
    default: 0
  },
  parentId: {
    type: String,
    default: ''
  },
  fid: {
    type: String,
    unique: true,
    required: true
  },
  tCount: {
    digest: {
      type: Number,
      default: 0
    },
    normal: {
      type: Number,
      default: 0
    }
  },
  type: {
    type: String,
    required: true,
    index: 1
  },
  visibility: {
    type: Boolean,
    default: false
  }
});
// 验证是否有权限进入此版块
forumSchema.methods.ensurePermission = function (visibleFid) {
  return visibleFid.includes(this.fid);
};
// 若是父板块则返回有权限访问的子版块的fid
forumSchema.methods.getFidOfChildForum = async function (visibleFid) {
  const ForumModel = require('./ForumModel');
  let fidArr = [];
  fidArr.push(this.fid);
  if(this.type === 'category') {
    let forums = await ForumModel.find({parentId: this.fid});
    forums.map(forum => {
      if(forum.ensurePermission(visibleFid))
        fidArr.push(forum.fid);
    });
  }
  return fidArr;
};

forumSchema.methods.getThreadsByQuery = async function(query, match) {
  const ThreadModel = require('./ThreadModel');
  const {$match, $sort, $skip, $limit} = getQueryObj(query, match);
  let threads = await ThreadModel.find($match).sort($sort).skip($skip).limit($limit);
  threads = await Promise.all(threads.map(t => t.extend()));
  return threads;
};

forumSchema.methods.getThreadCountByQuery = async function(query) {
  const ThreadModel = require('./ThreadModel');
  return await ThreadModel.count(query);
};

forumSchema.methods.getToppedThreads = async function(visibleFid) {
  const ThreadModel = require('./ThreadModel');
  const fidArr = await this.getFidOfChildForum(visibleFid);
  let threads = await ThreadModel.find({fid: {$in: fidArr}, topped: true});
  threads = await Promise.all(threads.map(t => t.extend()));
  return threads;
};

forumSchema.methods.setCountOfDigestThread = async function(number) {
  const obj = {tCount: this.tCount};
  obj.tCount.digest = obj.tCount.digest + number;
  obj.tCount.normal = obj.tCount.digest - number;
  return await this.update(obj);
};

module.exports = mongoose.model('forums', forumSchema);