const mongoose = require("../settings/database");
const {obtainPureText} = require("../nkcModules/apiFunction");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  columnId: {
    type: Number,
    required: true,
    index: 1
  },
  // 对应内容的创建时间
  top: {
    type: Date,
    required: true,
    index: 1
  },
  pid: {
    type: String,
    required: true,
    index: 1
  },
  tid: {
    type: String,
    required: true,
    index: 1
  },
  // 内容类型 post: 回复, thread: 文章
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 专栏内的文章分类ID
  cid: {
    type: Number,
    default: null,
    index: 1
  },
  // 在专栏隐藏
  hidden: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 当前文档创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: "columnPosts"
});
/*
* 拓展专栏的内容
* */
schema.statics.extendColumnPosts = async (columnPosts) => {
  if(columnPosts.length === 0) return [];
  const PostModel = mongoose.model("posts");
  const ThreadModel = mongoose.model("threads");
  const UserModel = mongoose.model("users");
  const pid = new Set();
  const tid = new Set();
  const uid = new Set();
  const postsObj = {}, threadsObj = {};
  columnPosts.map(post => {
    pid.add(post.pid);
    tid.add(post.tid);
  });
  let threads = await ThreadModel.find({tid: {$in: [...tid]}});
  threads = await ThreadModel.extendThreads(threads, {htmlToText: true});
  threads.map(thread => {
    threadsObj[thread.tid] = thread;
  });
  const posts = await PostModel.find({pid: {$in: [...pid]}});
  posts.map(post => {
    postsObj[post.pid] = post;
    uid.add(post.uid);
  });
  const usersObj = {};
  const users = await UserModel.find({uid: {$in: [...uid]}});
  users.map(user => {
    usersObj[user.uid] = user;
  });
  const results = [];
  for(let p of columnPosts) {
    p = p.toObject();
    p.thread = threadsObj[p.tid];
    if(p.type === "thread") {
      p.post = p.thread.firstPost;
    } else {
      p.post = postsObj[p.pid];
      p.post = p.post.toObject();
      p.post.c = obtainPureText(p.post.c, true, 200);
      p.post.user = usersObj[p.post.uid];
    }
    p.post.url = await PostModel.getUrl(p.pid);
    results.push(p)
  }
  return results;
};

module.exports = mongoose.model("columnPosts", schema);