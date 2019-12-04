const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 提交投诉的人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 举报的内容ID
  contentId: {
    type: String,
    required: true,
    index: 1
  },
  // 投诉时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 投诉对象类型 文章、用户、回复
  type: {
    type: String, // thread, user, post
    required: true,
    index: 1
  },
  // 投诉的原因类型
  reasonType: {
    type: String,
    required: true,
    index: 1
  },
  // 投诉补充说明
  reasonDescription: {
    type: String,
    default: ""
  },
  // 是否处理
  resolved: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 处理人ID
  handlerId: {
    type: String,
    default: "",
    index: 1
  },
  // 处理时间
  resolveTime: {
    type: Date,
    default: null,
    index: 1
  },
  // 处理结果
  result: {
    type: String,
    default: ""
  }
}, {
  collection: "complaints"
});

/*
* 拓展举报信息
* @param {[Object]} complaints 举报信息对象数组
* @return {[Object]} 拓展后的数据
* @author pengxiguaa 2019-5-14
* */
schema.statics.extendComplaints = async (complaints) => {
  const UserModel = mongoose.model("users");
  const PostModel = mongoose.model("posts");
  const ThreadModel = mongoose.model("threads");
  const uid = new Set(), pid = new Set(), tid = new Set();
  const userObj = {}, postObj = {}, threadObj = {};
  complaints.map(c => {
    const {type} = c;
    uid.add(c.uid);
    if(type === "user") {
      uid.add(c.contentId);
    } else if(type === "thread") {
      tid.add(c.contentId);
    } else if(type === "post") {
      pid.add(c.contentId);
    }
    if(c.handlerId) uid.add(c.handlerId);
  });

  const users = await UserModel.find({uid: {$in: [...uid]}});
  let posts = await PostModel.find({pid: {$in: [...pid]}});
  let threads = await ThreadModel.find({tid: {$in: [...tid]}});
  posts = await PostModel.extendPosts(posts, {
    user: true,
    userGrade: false,
    resource: false,
    usersVote: false,
    credit: false
  });
  threads = await ThreadModel.extendThreads(threads, {
    forum: false,
    category: false,
    firstPost: true,
    firstPostUser: true,
    userInfo: false,
    lastPost: false,
    lastPostUser: false,
    firstPostResource: false,
    htmlToText: false,
    count: 200
  });

  users.map(user => {
    userObj[user.uid] = user;
  });
  for(let post of posts) {
    post.url = await PostModel.getUrl(post);
    postObj[post.pid] = post;
  }
  threads.map(thread => {
    threadObj[thread.tid] = thread;
  });

  const results = [];

  for(const c of complaints) {
    const {type} = c;
    const r = c.toObject();
    r.user = userObj[c.uid];
    if(type === "user") {
      r.content = userObj[c.contentId];
    } else if(type === "post") {
      r.content = postObj[c.contentId];
    } else if(type === "thread"){
      r.content = threadObj[c.contentId];
    }
    if(r.handlerId) {
      r.handler = userObj[c.handlerId];
    }
    results.push(r);
  }
  return results;
};

schema.statics.findById = async (_id) => {
  const Model = mongoose.model("complaints");
  const complaint = Model.findOne({_id});
  if(!complaint) throwErr(404, `未找到ID为【${_id}】的投诉记录`);
  return complaint;
};

module.exports = mongoose.model("complaints", schema);

