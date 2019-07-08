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
  // 内容来源 own: 自己, contribute: 投稿【, reprint: 转载】
  from: {
    type: String,
    default: "own"
  },
  // 文章排序
  order: {
    type: Schema.Types.Mixed,
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
    type: [Number],
    default: [],
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
schema.statics.extendColumnPosts = async (columnPosts, fidOfCanGetThread) => {
  if(columnPosts.length === 0) return [];
  const PostModel = mongoose.model("posts");
  const ThreadModel = mongoose.model("threads");
  const UserModel = mongoose.model("users");
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const pid = new Set();
  const tid = new Set();
  const uid = new Set();
  let cid = [];
  const postsObj = {}, threadsObj = {};
  columnPosts.map(post => {
    pid.add(post.pid);
    tid.add(post.tid);
    cid = cid.concat(post.cid);
  });
  const threadMatch = {
    tid: {
      $in: [...tid]
    }
  };
  if(fidOfCanGetThread) {
    threadMatch.recycleMark = {$ne: true};
    threadMatch.disabled = false;
    threadMatch.reviewed = true;
    threadMatch.mainForumsId = {$in: fidOfCanGetThread};
  }
  let threads = await ThreadModel.find(threadMatch);
  threads = await ThreadModel.extendThreads(threads, {
    htmlToText: true,
    category: false,
    firstPost: true,
    firstPostUser: true,
    userInfo: true,
    firstPostResource: false,
    count: 150,
    forum: false,
    lastPost: false,
    lastPostUser: false
  });
  threads.map(thread => {
    threadsObj[thread.tid] = thread;
  });
  const postMatch = {
    pid: {$in: [...pid]}
  };
  if(fidOfCanGetThread) {
    postMatch.toDraft = {$ne: true};
    postMatch.disabled = false;
    postMatch.mainForumsId = {$in: fidOfCanGetThread};
  }
  const posts = await PostModel.find(postMatch);
  posts.map(post => {
    postsObj[post.pid] = post;
    uid.add(post.uid);
  });
  const usersObj = {};
  const users = await UserModel.find({uid: {$in: [...uid]}});
  users.map(user => {
    usersObj[user.uid] = user;
  });
  const categories = await ColumnPostCategoryModel.find({_id: {$in: cid}});
  const categoriesObj = {};
  categories.map(c => {
    categoriesObj[c._id] = c;
  });
  const results = [];
  for(let p of columnPosts) {
    p = p.toObject();
    p.thread = threadsObj[p.tid];
    if(!p.thread) continue;
    if(p.type === "thread") {
      p.post = p.thread.firstPost;
    } else {
      p.post = postsObj[p.pid];
      if(!p.post) continue;
      p.post = p.post.toObject();
      p.post.c = obtainPureText(p.post.c, true, 200);
      p.post.user = usersObj[p.post.uid];
    }
    p.post.url = await PostModel.getUrl(p.pid);
    p.categories = [];
    for(const id of p.cid) {
      const c = categoriesObj[id];
      if(c) {
        p.categories.push(c);
      }
    }
    results.push(p)
  }
  return results;
};
/*
* 生成在各分类的排序
* */
schema.statics.getCategoriesOrder = async (categoriesId) => {
  const SettingModel = mongoose.model("settings");
  const order = {};
  order[`cid_default`] = await SettingModel.operateSystemID('columnPostOrders', 1);
  for(const _id of categoriesId) {
    order[`cid_${_id}`] = await SettingModel.operateSystemID('columnPostOrders', 1);
  }
  return order;
};

schema.statics.getToppedColumnPosts = async (columnId, fidOfCanGetThread, cid) => {
  const ColumnPostModel = mongoose.model("columnPosts");
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const ColumnModel = mongoose.model("columns");
  const column = await ColumnModel.findOne({_id: columnId});
  if(!column) return [];
  let columnPosts = [];
  let columnPostsId = [];
  if(!cid) {
    columnPostsId = column.topped;
  } else {
    const category = await ColumnPostCategoryModel.findOne({_id: cid});
    if(!category) return [];
    columnPostsId = category.topped;
  }
  for(const _id of columnPostsId) {
    const columnPost = await ColumnPostModel.findOne({_id});
    if(columnPost) columnPosts.push(columnPost);
  }
  return await ColumnPostModel.extendColumnPosts(columnPosts, fidOfCanGetThread);
};

/*
* 向专栏推送文章
* @param {Number} columnId 专栏对象
* @param {[Number]} categoriesId 专栏文章分类ID数组
* @param [String] postsId postId数组
* */
schema.statics.addColumnPosts = async (columnId, categoriesId, postsId) => {
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const PostModel = mongoose.model("posts");
  const ThreadModel = mongoose.model("threads");
  const SettingModel = mongoose.model("settings");
  const ColumnPostModel = mongoose.model("columnPosts");
  const column = await mongoose.model("columns").findOne({_id: columnId});
  if(!categoriesId || categoriesId.length === 0) throwErr(400, "文章分类不能为空");
  const categoriesId_ = [];
  for(const _id of categoriesId) {
    const c = await ColumnPostCategoryModel.findOne({_id, columnId});
    if(c) categoriesId_.push(_id);
  }
  for(const pid of postsId) {
    let columnPost = await ColumnPostModel.findOne({columnId, pid});
    const order = await ColumnPostModel.getCategoriesOrder(categoriesId);
    if(columnPost) {
      await columnPost.update({
        cid: categoriesId,
        order
      });
      continue;
    }
    const post = await PostModel.findOne({pid});
    if(!post) continue;
    const thread = await ThreadModel.findOne({tid: post.tid});
    columnPost = ColumnPostModel({
      _id: await SettingModel.operateSystemID("columnPosts", 1),
      tid: thread.tid,
      top: post.toc,
      order,
      pid,
      type: thread.oc === pid? "thread": "post",
      columnId: column._id,
      cid: categoriesId_
    });
    await columnPost.save();
  }
};

module.exports = mongoose.model("columnPosts", schema);