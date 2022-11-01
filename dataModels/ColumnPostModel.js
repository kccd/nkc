const mongoose = require("../settings/database");
const {obtainPureText} = require("../nkcModules/apiFunction");
const Schema = mongoose.Schema;
const columnPostTypes = {
  post: 'post',
  thread: 'thread',
  article: 'article',
};
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
  //对应内容的uid
  tUid: {
    type: String,
    require: true,
    index: 1
  },
  // 与 type 类型对应的 ID
  // type: post, pid 表示 post.pid
  // type: thread, pid 表示 thread.oc
  // type: article, pid 表示 article._id
  pid: {
    type: String,
    required: true,
    index: 1
  },
  tid: {
    type: String,
    default: '',
    index: 1
  },
  // 内容类型
  // post: 回复
  // thread: 文章
  // article: 文章（包含空间文章、专栏文章等）
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 专栏内的文章主分类ID
  cid: {
    type: [Number],
    default: [],
    index: 1
  },
  // 专栏内的文章辅助分类ID
  mcid: {
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
* 获取 type
* */
schema.statics.getColumnPostTypes = async () => {
  return columnPostTypes;
};

/*
@param{object} filterData 过滤的数据
@param{array} allowKey filterData保留的key

*/
schema.statics.filterData = async (filterData, allowKey) => {
  if(!filterData) return {}
  const {timeFormat} = require('../nkcModules/tools');
  let newObj = {}
  for (const key in filterData) {
    if (Object.hasOwnProperty.call(filterData, key)) {
      if(allowKey.includes(key)){
        if(key === 'toc') {
          newObj[key] = timeFormat(filterData[key])
          continue;
        }
        const item = filterData[key];
        newObj[key] = item
      }
    }
  }
  return newObj
}
/*  返回专栏文章需要的字段
    @param {Number} columnId 专栏ID
*   @param {Number}  专栏引用_id columnPosts的 _ID
*/
schema.statics.getDataRequiredForArticle = async (columnId, _id, xsf) => {
  const ColumnPostModel = mongoose.model('columnPosts');
  //查找当前引用信息
  const articleData = await ColumnPostModel.getArticleDataById(columnId, _id);
  const {article: articleType, thread: threadType} = await ColumnPostModel.getColumnPostTypes();
  let res = {};
  if(articleData.type === articleType){
    const {_id: columnPostId, thread, article, editorUrl, column, mainCategory, auxiliaryCategory, type} = articleData;
    const {uid, atUsers, origin, toc, title, abstract, abstractEN, keywordsEN, keywords, content, tlm, dt, authorInfos} = article.document;
    //获取文章评论数
    thread.count = article.count;
    res = {
      _id: columnPostId,
      type,
      thread,
      article,
      editorUrl,
      user: article.user,
      column,
      mainCategory,
      auxiliaryCategory,
      post: {
        authorInfos,
        dt,
        uid,
        originState: origin,
        toc,
        tlm: article.tlm,
        t: title,
        abstractCn: abstract,
        abstractEn: abstractEN,
        keyWordsCn: keywords,
        keyWordsEn: keywordsEN,
        c: await ColumnPostModel.getRenderHTML(content, article.documentResourceId, xsf, atUsers),
      }
    };
  } else if(articleData.type === threadType) {
    const {article, thread, _id, column, user, resources, mainCategory, auxiliaryCategory, type, url} = articleData;
    const {uid, atUsers, originState, toc, t, abstractCn, abstractEn, keyWordsCn, keyWordsEn, c, tlm, authorInfos, dt} = article;
    thread.url = url;
    res = {
      _id,
      type,
      thread,
      article,
      user,
      column,
      mainCategory,
      auxiliaryCategory,
      post: {
        authorInfos,
        dt,
        uid,
        tlm,
        toc,
        originState,
        t,
        abstractCn,
        abstractEn,
        keyWordsCn,
        keyWordsEn,
        c: await ColumnPostModel.getRenderHTML(c, resources, xsf, atUsers),
      }
    };
  } else {
    return;
  }
  return res;
}

/*
* 获取渲染的富文本
* */
schema.statics.getRenderHTML = async function(content, documentResourceId, xsf, atUsers = []) {
  const nkcRender = require('../nkcModules/nkcRender');
  const ResourceModel = mongoose.model('resources');
  let resources;
  if(typeof documentResourceId === 'string') {
    resources = await ResourceModel.getResourcesByReference(documentResourceId);
  } else {
    resources = documentResourceId;
  }
  return nkcRender.renderHTML({
    post: {
      c: content,
      resources,
      atUsers
    },
    user:{xsf},
  })
}

/*
* 根据 专栏ID 和 columnPosts的_id 查找 一篇文章的所有数据
*  @param {Number} _id 专栏ID
*  @param {Number}  columnPosts的_id columnPosts的 _ID
*/
schema.statics.getArticleDataById = async function(columnId, _id){
  const ColumnPostsModel = mongoose.model('columnPosts');
  const ThreadModel = mongoose.model('threads');
  const ArticleModel = mongoose.model('articles');
  //获取文章专栏引用
  let columnPost = await ColumnPostsModel.findOne({_id, columnId})
  columnPost = columnPost.toObject()
  if(!columnPost) throwErr(400, '未找到文章引用');
  switch (columnPost.type) {
    case 'thread':
      //拓展thread文章信息
      return await ThreadModel.getThreadInfoByColumn(columnPost);
    case 'article':
      //拓展article文章信息
      return await ArticleModel.getArticleInfoByColumn(columnPost);
    default:
      break;
  }
}
/*
* 拓展专栏的内容
* @params {array} columnPosts 需要拓展的专栏引用
* @params {array} fidOfCanGetThread 当前访问者能访问的专业
* @params {object} user 当前访问用户
* @params {boolean} isModerator 是否有权查看状态不正常的文章
* @return {array} results 返回拓展的文章信息列表
* */
schema.statics.extendColumnPosts = async (options) => {
  const {columnPosts, fidOfCanGetThread, isModerator} = options;
  if (columnPosts.length === 0) return [];
  const PostModel = mongoose.model("posts");
  const ThreadModel = mongoose.model("threads");
  const UserModel = mongoose.model("users");
  const ColumnModel = mongoose.model("columns");
  const ArticleModel = mongoose.model('articles');
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const {normal} = await ArticleModel.getArticleStatus();
  const pid = new Set();
  const tid = new Set();
  const uid = new Set();
  const aid = new Set();
  const columnId = new Set();
  let cid = [];
  const postsObj = {}, threadsObj = {}, articleObj = {};
  //文章类型分类
  columnPosts.map(post => {
    if (post.type === 'post') pid.add(post.pid);
    if (post.type === 'thread') tid.add(post.tid);
    if (post.type === 'article') aid.add(post.pid);
    columnId.add(post.columnId);
    cid = cid.concat(post.cid, post.mcid);
  });
  //文章查找规则
  const threadMatch = {
    tid: {
      $in: [...tid]
    }
  };
  if (fidOfCanGetThread) {
    threadMatch.mainForumsId = {$in: fidOfCanGetThread};
  }
  if(!isModerator) {
    threadMatch.recycleMark = {$ne: true};
    threadMatch.disabled = false;
    threadMatch.reviewed = true;
  }
  //查找文章对应的专栏
  const columns = await ColumnModel.find({_id: {$in: [...columnId]}});
  const columnsObj = {};
  columns.map(column => {
    columnsObj[column._id] = column;
  });
  let threads = await ThreadModel.find(threadMatch);
  //拓展thread
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
    lastPostUser: false,
    removeLink: true,
  });
  threads.map(thread => {
    threadsObj[thread.tid] = thread;
  });
  //post文章查找规则
  const postMatch = {
    pid: {$in: [...pid]}
  };
  if (fidOfCanGetThread) {
    postMatch.mainForumsId = {$in: fidOfCanGetThread};
  }
  if(!isModerator) {
    postMatch.toDraft = {$ne: true};
    postMatch.disabled = false;
  }
  const posts = await PostModel.find(postMatch);
  posts.map(post => {
    postsObj[post.pid] = post;
    uid.add(post.uid);
  });
  //独立文章查找
  const articleMatch = {
    _id: {$in: [...aid]}
  };
  if(!isModerator) {
    articleMatch.status = normal;
  }
  const {column: columnSource, zone: zoneSource} = await ArticleModel.getArticleSources();
  if (fidOfCanGetThread) {
    // articleMatch.status = normal;
    articleMatch.source = {$in: [columnSource, zoneSource]};
  }
  let articles = await ArticleModel.find(articleMatch);
  const articleOptions = [
    '_id',
    'content',
    'title',
    'cover',
    'toc',
  ]
  articles = await ArticleModel.extendDocumentsOfArticles(articles, 'stable', articleOptions);
  articles.map(article => {
    articleObj[article._id] = article;
    uid.add(article.uid);
  })
  const usersObj = {};
  const users = await UserModel.find({uid: {$in: [...uid]}});
  users.map(user => {
    usersObj[user.uid] = user;
  });
  const categories = await ColumnPostCategoryModel.find({_id: {$in: cid}}, {_id: 1, name: 1, description: 1});
  const categoriesObj = {};
  categories.map(c => {
    categoriesObj[c._id] = c;
  });
  const results = [];
  for(let p of columnPosts) {
    p = p.toObject();
    p.column = columnsObj[p.columnId];
    if(!p.column) continue;
    p.thread = threadsObj[p.tid];
    if(!p.thread && p.type !== 'article') continue;
    if(p.type === "thread") {
      if(p.thread.firstPost.anonymous) {
        p.thread.uid = "";
        p.thread.firstPost.uid = "";
        p.thread.firstPost.user = "";
      }
      p.post = p.thread.firstPost;
    } else if(p.type === 'post') {
      p.post = postsObj[p.pid];
      if(!p.post) continue;
      if(p.post.anonymous) {
        p.post.uid = "";
      } else {
        p.post.user = usersObj[p.post.uid];
      }
      p.post = p.post.toObject();
      p.post.c = obtainPureText(p.post.c, true, 200);
    } else if(p.type === 'article') {
      p.article = articleObj[p.pid];
      if(!p.article) continue;
      p.article.user = usersObj[p.article.uid];
      p.article.document.content = obtainPureText(p.article.document.content, true, 200);
    }
    // p.post.url = await PostModel.getUrl(p.pid);
    if(p.post) {
      //论坛文章链接
      p.post.url = `/m/${p.columnId}/a/${p._id}`
    } else {
      //专栏文章链接
      p.article.url = `/m/${p.columnId}/a/${p._id}`;
    }
    p.mainCategories = [];
    p.minorCategories = [];
    //添加主分类
    for(const id of p.cid) {
      const c = categoriesObj[id];
      if(c) {
        p.mainCategories.push(c);
      }
    }
    //添加子分类
    for(const id of p.mcid) {
      const c = categoriesObj[id];
      if(c) {
        p.minorCategories.push(c);
      }
    }
    results.push(p);
  }
  return results;
};
/*
* 生成在各主分类的排序
* @param {[String]} categoriesId 主分类数组
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

/*
* 拓展专栏首页专栏引用文章
* @params {string} columnId 专栏 ID
* @params {string} fidOfCanGetThread 当前用户能访问的专业ID
* @params {array} cid 访问的分类id
* */
schema.statics.getToppedColumnPosts = async (options) => {
  const {columnId, fidOfCanGetThread, cid, user, isModerator} = options;
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
  return await ColumnPostModel.extendColumnPosts({columnPosts, fidOfCanGetThread, user, isModerator});
};

/*
* 向专栏推送文章
* @param {Number} columnId 专栏对象
* @param {[Number]} categoriesId 专栏文章分类ID数组
* @param [String] postsId postId数组
* */
schema.statics.addColumnPosts = async (columnId, categoriesId, minorCategoriesId, postsId) => {
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const PostModel = mongoose.model("posts");
  const ThreadModel = mongoose.model("threads");
  const SettingModel = mongoose.model("settings");
  const ColumnPostModel = mongoose.model("columnPosts");
  const column = await mongoose.model("columns").findOne({_id: columnId});
  if(!categoriesId || categoriesId.length === 0) {
    const category = await ColumnPostCategoryModel.findOne({columnId, default: true});
    categoriesId = [category._id];
  }
  const categoriesId_ = [], minorCategoriesId_ = [];
  for(const _id of categoriesId) {
    const c = await ColumnPostCategoryModel.findOne({_id, columnId});
    if(c) categoriesId_.push(_id);
  }
  for(const _id of minorCategoriesId) {
    const c = await ColumnPostCategoryModel.findOne({_id, columnId});
    if(c) minorCategoriesId_.push(_id);
  }
  for(const pid of postsId) {
    let columnPost = await ColumnPostModel.findOne({columnId, pid});
    //获取著分类排序
    const order = await ColumnPostModel.getCategoriesOrder(categoriesId);
    if(columnPost) {
      await columnPost.updateOne({
        cid: categoriesId_,
        mcid: minorCategoriesId_,
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
      tUid: thread.uid,
      pid,
      type: thread.oc === pid? "thread": "post",
      columnId: column._id,
      cid: categoriesId_,
      mcid: minorCategoriesId_,
      from: post.uid === column.uid? 'own': 'reprint'
    });
    await columnPost.save();
  }
  await column.updateBasicInfo();
};
/*
* 标记专栏文章所对应的thread，inColumn字段;
* */
schema.post("save", async function(columnPost) {
  if(columnPost.type === "thread") {
    await mongoose.model("threads").updateOne({tid: columnPost.tid}, {
      $set: {
        inColumn: true
      },
      $addToSet: {
        columnsId: columnPost.columnId
      }
    });
  }
});
schema.post("remove", async function(columnPost) {
  if(columnPost.type === "thread") {
    const count = await mongoose.model("columnPosts").countDocuments({
      _id: {$ne: columnPost._id},
      type: "thread",
      tid: columnPost.tid
    });
    const obj = {
      $pull: {
        columnsId: columnPost.columnId
      }
    };
    if(count === 0) {
      obj.$set = {
        inColumn: false
      }
    }
    await mongoose.model("threads").updateOne({tid: columnPost.tid}, obj);
  }
  const column = await mongoose.model('columns').findOne({_id: columnPost.columnId});
  if(column) await column.updateBasicInfo();
});
/*
* 检测专栏中是否存在指定内容
* @param {Number} columnId 专栏ID
* @param {String} pid post ID
* @return {Boolean} 是否存在
* @author pengxiguaa 2020-12-15
* */
schema.statics.checkColumnPost = async (columnId, pid) => {
  const ColumnPostModel = mongoose.model('columnPosts');
  const count = await ColumnPostModel.countDocuments({columnId, pid});
  return count > 0;
}

/*
* 加载指定数目的专栏最新文章
* @param {Number} columnId 专栏ID
* @param {Number} count 条数
* */
schema.statics.getLatestThreads = async (columnId, count = 3, fids) => {
  const {getUrl} = require('../nkcModules/tools');
  const ColumnPostModel = mongoose.model('columnPosts');
  let columnPosts = await ColumnPostModel.find({
    hidden: false,
    columnId,
    type: {
      $in: ['thread', 'article']
    }
  })
    .sort({toc: -1})
    .limit(count);
  columnPosts = await ColumnPostModel.extendColumnPosts({
    columnPosts: columnPosts,
    fidOfCanGetThread: fids,
    isModerator: false
  });
  const results = [];
  for(const cp of columnPosts) {
    const url = getUrl('columnThread', cp.columnId, cp._id);
    let title;
    if(cp.type === 'thread') {
      title = cp.post.t;
    } else {
      title = cp.article.document.title;
    }
    results.push({
      title,
      url
    });
  }
  return results;
};

/*
* 创建专栏文章发布引用记录
* @params {object} article 需要创建引用的文章article
* */
schema.statics.createColumnPost = async function(article, selectCategory) {
  const SettingModel = mongoose.model('settings');
  const ColumnPostModel = mongoose.model('columnPosts');
  const ColumnModel = mongoose.model('columns');
  let {_id, sid, uid, toc} = article;
  if(!sid) {
    sid = selectCategory.selectedMainCategories[0].columnId
  }
  if(!sid) {
    sid = selectCategory.selectedMinorCategoriess[0].columnId;
  }
  if(!sid) {
    throwErr(500, '未找到分享的专栏');
  }
  //如果article存在sid,通过sid查找专栏
  const column = await ColumnModel.findOnly({_id: sid});
  const order = await ColumnPostModel.getCategoriesOrder(selectCategory.selectedMainCategoriesId);
  const columnPost = ColumnPostModel({
    _id: await SettingModel.operateSystemID("columnPosts", 1),
    order,
    columnId: sid,
    from: article.uid === column.uid ? 'own': 'reprint',
    top: toc,
    pid: _id,
    type: 'article',
    cid: selectCategory.selectedMainCategoriesId,
    mcid: selectCategory.selectedMinorCategoriesId,
    tUid: uid,
  });
  await columnPost.save();
  return columnPost;
}

/*
* 通过 article id 删除专栏引用
* */
schema.statics.deleteColumnPost = async function(aid) {
  const ArticleModel = mongoose.model('articles');
  const ColumnPostModel = mongoose.model('columnPosts');
  const article = await ArticleModel.findOnly({_id: aid});
  const {article: articleType} = await ColumnPostModel.getColumnPostTypes();
  if(!article) throwErr(400, `_id为 ${aid}的文章不存在`);
  const {_id} = article;
  await ColumnPostModel.deleteOne({pid: _id, type: articleType});
}

/*
* 拓展专栏文章显示列表
* @params {Object} articles 需要拓展的article集合
*
* */
schema.statics.extendColumnArticles = async function(articles) {
  const ArticleModel = mongoose.model('articles');
  const _articles = await ArticleModel.getArticlesInfo(articles);
  return _articles;
}

/*
* 拓展专栏引用的专栏信息
* */
schema.methods.extendColumnPost = async function() {
  const ColumnModel = mongoose.model('columns');
  const {columnId} = this;
  const column = await ColumnModel.findOne({_id: columnId});
  return column;
}


module.exports = mongoose.model("columnPosts", schema);
