const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 投稿人
  uid: {
    type: String,
    index: 1,
    required: true
  },
  cid: {
    type: [Number],
    required: true
  },
  pid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  columnId: {
    type: Number,
    required: true,
    index: 1
  },
  tid: {
    type: String,
    required: true,
    index: 1
  },
  description: {
    type: String,
    default: ""
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  reason: {
    type: String,
    default: ""
  },
  passed: {
    type: Boolean,
    default: null,
    index: 1
  }
}, {
  collection: "columnContributes"
});

schema.statics.extendContributes = async (contributes) => {
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const uid = new Set(), tid = new Set();
  contributes.map(c => {
    uid.add(c.uid);
    tid.add(c.tid);
  });
  const users = await UserModel.find({uid: {$in: [...uid]}});
  let threads = await ThreadModel.find({tid: {$in: [...tid]}});
  threads = await ThreadModel.extendThreads(threads);
  const usersObj = {}, threadsObj = {};
  users.map(user => {
    usersObj[user.uid] = user;
  });
  threads.map(thread => {
    threadsObj[thread.tid] = thread;
  });
  const results = [];
  for(let c of contributes) {
    c = c.toObject();
    c.thread = threadsObj[c.tid];
    if(c.thread.firstPost.anonymous) {
      c.thread.uid = "";
      c.thread.firstPost.uid = "";
      c.thread.firstPost.user = "";
    } else {
      c.user = c.thread.firstPost.user;
    }

    results.push(c);
  }
  return results;
};

module.exports = mongoose.model("columnContributes", schema);
