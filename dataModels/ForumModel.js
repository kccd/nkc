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
  threads = await Promise.all(threads.map(async t => {
    await t.extendFirstPost().then(p => p.extendUser());
    await t.extendLastPost().then(p => p.extendUser());
    return t;
  }));
  return threads;
};

forumSchema.methods.getThreadCountByQuery = async function(query) {
  const ThreadModel = require('./ThreadModel');
  return await ThreadModel.count(query);
};

forumSchema.methods.getToppedThreads = async function(fidOfChildForum) {
  const ThreadModel = require('./ThreadModel');
  let threads = await ThreadModel.find({fid: {$in: fidOfChildForum}, topped: true});
  threads = await Promise.all(threads.map(async t => {
    await t.extendFirstPost().then(p => p.extendUser());
    await t.extendLastPost().then(p => p.extendUser());
    return t;
  }));
  return threads;
};


forumSchema.methods.updateForumMessage = async function() {
  const ThreadModel = require('./ThreadModel');
  const threads = await ThreadModel.find({fid: this.fid}, {_id: 0, count: 1, countToday: 1, digest: 1});
  const countThreads = threads.length;
  let countPosts = 0;
  let countPostsToday = 0;
  let digest = 0;
  for (let thread of threads) {
    countPosts += thread.count;
    countPostsToday += thread.countToday;
    if(thread.digest) digest++;
  }
  const normal = countThreads - digest;
  await this.update({
    countPosts,
    countPostsToday,
    countThreads,
    tCount: {
      digest,
      normal
    }
  });
};

forumSchema.methods.newPost = async function(post, user, ip, cid, toMid) {
  const SettingModel = require('./SettingModel');
  const ThreadModel = require('./ThreadModel');
  const PersonalForumModel = require('./PersonalForumModel');
  const tid = await SettingModel.operateSystemID('threads', 1);
  const t = {
    tid,
    cid,
    fid: this.fid,
    mid: user.uid,
    uid: user.uid,
  };
  if(toMid && toMid !== user.uid) {
    const targetPF = await PersonalForumModel.findOnly({uid: toMid});
    if(targetPF.moderators.indexOf(user.uid) > -1)
      t.toMid = toMid;
    else
      throw (new Error("only personal forum's moderator is able to post"))
  }
  const thread = await new ThreadModel(t).save();
  const _post = await thread.newPost(post, user, ip, cid);
  await thread.update({$set:{lm: _post.pid, oc: _post.pid, count: 1, hits: 1}});
  await this.update({$inc: {
    'tCount.normal': 1,
    'countPosts': 1,
    'countThreads': 1
  }});
  return _post;
};

module.exports = mongoose.model('forums', forumSchema);