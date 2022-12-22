const settings = require('../settings');
const mongoose = settings.database;
const redisClient = require("../settings/redisClient");
const Schema = mongoose.Schema;
const apiFunction = require('../nkcModules/apiFunction');
const elasticSearch = require('../nkcModules/elasticSearch');
const {getQueryObj, obtainPureText} = apiFunction;
const threadSchema = new Schema({
  tid: {
    type: String,
    unique: true,
    required:true
  },
  // 类型 article: 文章， product: 商城的商品
  type: {
    type: String,
    default: 'article',
    index: 1
  },
  //文章的评论数量
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
    index: 1,
    default: 0
  },
  digest: {
    type: Boolean,
    default: false,
    index: 1
  },
  digestTime: {
    type: Date,
    default: null,
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
    default: '',
    index: 1
  },
  /*mid: {
    type: String,
    required: true
  },*/
  hasCover: {
    type: Boolean,
    default: true
  },
  recycleMark: {
    type: Boolean,
	  index: 1,
    default: false
  },
  //文章内容第一个pid
  oc: {
    type: String,
    default: '',
    index: 1
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
  /*toMid: {
    type: String,
    default: ''
  },*/
  topped: {
    type: Boolean,
	  index: 1,
    default:false
  },
  toppedUsers: {
    type: [String],
    default: []
  },
  // 主要分类
  mainForumsId: {
    type: [String],
    default: [],
    index: 1
  },
  // 辅助分类
  minorForumsId: {
    type: [String],
    default: [],
    index: 1
  },

  // 自定义分类
  customForumsId: {
    type: [String],
    default: [],
    index: 1
  },

  // cid的集合
  categoriesId: {
    type: [String],
    default: [],
    index: 1
  },

  uid: {
    type: String,
    required: true,
    index: 1
  },

  // 文章是否关闭，关闭后不可回复
	closed: {
  	type: Boolean,
		default: false,
		index: 1
	},

  // 首条回复的支持数
  voteUp: {
    type: Number,
    default: 0,
    index: 1
  },
  // 首条回复的反对数
  voteDown: {
    type: Number,
    default: 0,
    index: 1
  },

  // 所有回复的鼓励总数
  encourageTotal: {
    type: Number,
    default: 0,
    index: 1
  },

  // 支持总数 所有回复支持之和
  voteUpTotal: {
    type: Number,
    default: 0,
    index: 1
  },
  // 反对总数 所有回复反对之和
  voteDownTotal: {
    type: Number,
    default: 0,
    index: 1
  },

  // 最大支持数 回复中最高的支持数
  voteUpMax: {
    type: Number,
    default: 0,
    index: 1
  },

  // 回复的用户数，已去重
  replyUserCount: {
    type: Number,
    default: 0,
    index: 1
  },

  // 是否已经审核
  reviewed: {
    type: Boolean,
    default: false,
    index: 1
  },

  // 是否被推送到了专栏
  inColumn: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 被加入到专栏的ID
  columnsId: {
    type: [Number],
    index: 1,
    default: []
  },
  // 置顶的PostId
  toppedPostsId: {
    type: [String],
    default: []
  },
  // 多维分类ID
  tcId: {
    type: [Number],
    default: [],
    index: 1
  }
}, {toObject: {
  getters: true,
  virtuals: true
}});
threadSchema.pre('save', function (next) {
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  next();
});

threadSchema.virtual('firstPost')
  .get(function() {
    return this._firstPost
  })
  .set(function(p) {
    this._firstPost = p
  });

threadSchema.virtual('threadCategories')
  .get(function() {
    return this._threadCategories;
  })
  .set(function(threadCategories) {
    this._threadCategories = threadCategories;
  })

threadSchema.virtual('threadCategoriesWarning')
  .get(function() {
    return this._threadCategoriesWarning;
  })
  .set(function(threadCategoriesWarning) {
    this._threadCategoriesWarning = threadCategoriesWarning;
  })

threadSchema.virtual('lastPost')
  .get(function() {
    return this._lastPost
  })
  .set(function(p) {
    this._lastPost = p
  });

threadSchema.virtual('forums')
  .get(function() {
    return this._forums
  })
  .set(function(f) {
    this._forums = f
  });

threadSchema.virtual('reason')
  .get(function() {
    return this._reason;
  })
  .set(function(reason) {
    this._reason = reason;
  });

threadSchema.virtual('columns')
  .get(function() {
    return this._columns
  })
  .set(function(f) {
    this._columns = f
  });
threadSchema.virtual('categories')
  .get(function() {
    return this._categories
  })
  .set(function(f) {
    this._categories = f
  });

threadSchema.virtual('category')
  .get(function() {
    return this._category
  })
  .set(function(c) {
    this._category = c;
  });

threadSchema.virtual('user')
  .get(function() {
    return this._user
  })
  .set(function(u) {
    this._user = u;
  });
threadSchema.virtual('reviewReason')
	.get(function() {
		return this._reviewReason
	})
	.set(function(reviewReason) {
		this._reviewReason = reviewReason;
	});
/* 返回此片文章作者的通讯方式
* @params {String} tid
*/
threadSchema.statics.getAuthorCommunicationMode = async (tid)=>{
  const ThreadModel = mongoose.model('threads')
  const communication = await ThreadModel.getThreadByTid(tid)
  let communicationMode = ''
  try {
    communicationMode.value = communication.firstPost.authorInfos.contractObj
  } catch (error) {
    // const throwError = require("../nkcMOdules/throwError");
    // throwError(400,'作者没有通讯方式')
  }
  return communicationMode
}
/*得到该整条记录
*@params {String} tid
*/
threadSchema.statics.getThreadByTid = async (tid)=>{
  const ThreadModel = mongoose.model('threads')
  const thread = await ThreadModel.findOne({tid})
  return await thread.extendFirstPost();
}
threadSchema.methods.extendFirstPost = async function() {
  const PostModel = mongoose.model('posts');
  return this.firstPost = await PostModel.findOnly({pid: this.oc})
};

threadSchema.methods.extendLastPost = async function() {
	const PostModel = mongoose.model('posts');
	return this.lastPost = (await PostModel
    .find({tid: this.tid, disabled: {$nin:[true]}})
    .sort({toc: -1}).limit(1))[0]
};
/*
  拓展文章的专业
  @param types 数组，专业的类型：mainForums, minorForums, customForums(自定义，待定)
  @return 专业对象数组
  @author pengxigua 2019/1/24
*/
threadSchema.methods.extendForums = async function(types) {
  let fids = [];
  if(types.includes('mainForums')) {
    fids = fids.concat(this.mainForumsId);
  }
  if(types.includes('minorForums')) {
    fids = fids.concat(this.minorForumsId);
  }
  const forums = await mongoose.model('forums').find({fid: {$in: fids}});
  const forumsObj = {};
  forums.map(f => {
    forumsObj[f.fid] = f;
  });
  const _forums = [];
  for(const fid of fids) {
    const forum = forumsObj[fid];
    if(forum) _forums.push(forum);
  }
  return this.forums = _forums;
};

/* threadSchema.methods.extendForum = async function() {
  const ForumModel = mongoose.model('forums');
  return this.forum = await ForumModel.findOnly({fid: this.fid})
}; */

threadSchema.methods.extendCategory = async function() {
	const ThreadTypeModel = mongoose.model('threadTypes');
  return this.category = await ThreadTypeModel.findOne({fid: this.fid, cid: this.cid});
};

threadSchema.methods.extendUser = async function() {
  const UserModel = mongoose.model('users');
  return this.user = await UserModel.findOnly({uid: this.uid});
};

// ------------------------------ 文章权限判断 ----------------------------
threadSchema.methods.ensurePermission = async function(roles, grade, user) {
  const throwError = require("../nkcMOdules/throwError");
  const recycleId = await mongoose.model('settings').getRecycleId();
  if(!this.forums) {
    await this.extendForums(["mainForums"]);
  }
  const isAuthor = user && user.uid === this.uid;
  for(const forum of this.forums) {
    try {
      // 自己可查看自己未在回收站内的文章
      if(forum.fid === recycleId || !isAuthor) {
        await forum.ensurePermission(roles, grade, user);
      }
    } catch(err) {
      let status = err.status;
      try{
        err = JSON.parse(err.message || err);
        err = err.errorData;
      } catch(e) {}
      let errorType = "noPermissionToReadThread";
      if(forum.fid === recycleId) {
        errorType = "threadHasBeenBanned";
        status = 404;
      }
      throwError(status, err, errorType);
    }
  }
};


// ----------------------------------------------------------------------

/*// 1、判断能否进入所在板块
// 2、判断所在帖子是否被禁
// 3、若所在帖子被禁则判断用户是否是该板块的版主或拥有比版主更高的权限
threadSchema.methods.ensurePermission = async function (ctx) {
	const forum = await this.extendForum();
	try {
		await forum.ensurePermission(ctx);
	} catch (e) {
		return false;
	}

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
    const forum = await ctx.ForumModel.findOnly({fid: this.fid});
    return ctx.data.user && forum.moderators.includes(ctx.data.user.uid);
  }
};*/

threadSchema.methods.getPostByQuery = async function (query, macth) {
  const PostModel = require('./PostModel');
  const {$match, $sort, $skip, $limit} = getQueryObj(query, macth);
  let posts = await PostModel.find($match)
    .sort({toc: 1}).skip($skip).limit($limit);
  await Promise.all(posts.map(async doc => {
    await doc.extendUser();
    await doc.extendResources();
  }));
  return posts;
};

/*
* 更新文章的支持、反对数量
* 数据来源于文章下的post
* */
threadSchema.methods.updateThreadVote = async function() {
  const PostModel = mongoose.model("posts");
  const updateObj = {};
  const oc = await PostModel.findOne({tid: this.tid}).sort({toc: 1});
  updateObj.voteUp = oc.voteUp;
  updateObj.voteDown = oc.voteDown;
  let count = await PostModel.aggregate([
    {
      $match: {
        tid: this.tid
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$voteUp"
        }
      }
    }
  ]);
  updateObj.voteUpTotal = count.length? count[0].total: 0;

  count = await PostModel.aggregate([
    {
      $match: {
        tid: this.tid
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$voteDown"
        }
      }
    }
  ]);
  updateObj.voteDownTotal = count.length? count[0].total: 0;

  const voteUpMax = await PostModel.findOne({tid: this.tid}).sort({voteUp: -1});
  updateObj.voteUpMax = voteUpMax? voteUpMax.voteUp: 0;
  await this.updateOne(updateObj);
};
/*
* 更新文章的鼓励数量
* */
threadSchema.methods.updateThreadEncourage = async function() {
  const PostModel = mongoose.model('posts');
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const posts = await PostModel.find({tid: this.tid}, {pid: 1});
  const pid = posts.map(p => p.pid);
  const encourageTotal = await KcbsRecordModel.countDocuments({type: "creditKcb", pid: {$in: pid}});
  await this.updateOne({encourageTotal});
};
// threadSchema.methods.addCount = async function () {
//   const ThreadModel = mongoose.model("threads");
//   const thread = await ThreadModel.findOne({tid: this.tid});
//   let {count, countToday, countRemain} = thread
//   const userCount = await PostModel.aggregate([
//     {
//       $match: {
//         tid: thread.tid
//       }
//     },
//     {
//       $group: {
//         _id: "$uid"
//       }
//     }
//   ]);
//   updateObj.replyUserCount = userCount.length - 1;

// }

// 更新文章 信息
threadSchema.methods.updateThreadMessage = async function(toSearch = true) {
  const ThreadModel = mongoose.model("threads");
  const apiFunction = require('../nkcModules/apiFunction');
  const today = apiFunction.today();
  const thread = await ThreadModel.findOne({tid: this.tid});
  const PostModel = mongoose.model('posts');
  const updateObj = {};
  const oc = await PostModel.findOneAndUpdate({tid: thread.tid}, {
    $set: {
      reviewed: thread.reviewed
    }
  }).sort({toc: 1});
  const lm = await PostModel.findOne({
    tid: thread.tid, disabled: false,
    parentPostId: "",
    $or: [
      {
        reviewed: true,
        toDraft: {
          $ne: true
        }
      },
      {
        pid: oc.pid,
        reviewed: false
      }
    ]
  }).sort({toc: -1});
  updateObj.tlm = lm?lm.toc:'';
  updateObj.toc = oc.toc;
  updateObj.lm = lm?lm.pid:'';
  updateObj.oc = oc.pid;
  updateObj.count = await PostModel.countDocuments({tid: thread.tid, type: "post", parentPostId: ""});
  updateObj.countToday = await PostModel.countDocuments({tid: thread.tid, type: "post", toc: {$gt: today}, parentPostId: ""});
  updateObj.countRemain = await PostModel.countDocuments({tid: thread.tid, type: "post", disabled: {$ne: true}, parentPostId: ""});
  const userCount = await PostModel.aggregate([
    {
      $match: {
        tid: thread.tid
      }
    },
    {
      $group: {
        _id: "$uid"
      }
    }
  ]);
  updateObj.replyUserCount = userCount.length - 1;
  // 更新文章 统计数据
  await thread.updateOne(updateObj);
  await PostModel.updateOne({pid: oc.pid}, {
    $set: {
      threadPostCount: updateObj.count
    }
  });
  await PostModel.updateMany({tid: thread.tid}, {
    $set: {
      mainForumsId: thread.mainForumsId,
      tcId: thread.tcId,
    }
  });
  // 更新搜索引擎中帖子的专业信息
  if(toSearch) await elasticSearch.updateThreadForums(thread);
};

threadSchema.methods.newPost = async function(post, user, ip) {
  const SettingModel = mongoose.model('settings');
  const PostModel = mongoose.model('posts');
  const socket = require('../nkcModules/socket');
  const MessageModel = mongoose.model('messages');
  const UserModel = mongoose.model('users');
  const pid = await SettingModel.operateSystemID('posts', 1);
  const {c, t, l, abstractCn, abstractEn, keyWordsCn = [], keyWordsEn = [], authorInfos=[], originState, parentPostId} = post;
  let {quote = ''} = post;
  // 如果存在引用，则先判断引用的post是否存在
  let quotePost;
  if(quote) {
    quotePost = await PostModel.findOne({tid: this.tid, pid: post.quote, type: "post"}, {cv: 1, pid: 1, uid: 1});
    // 记录被引用的Post的id和内容版本号cv
    quote += `:${quotePost.cv || 1}`
  }
  // 处理作者信息
  let newAuthInfos = [];
  if(authorInfos) {
    for(let a = 0;a < authorInfos.length;a++) {
      if(authorInfos[a].name.length > 0) {
        newAuthInfos.push(authorInfos[a])
      }else{
        let kcUser = await UserModel.findOne({uid: authorInfos[a].kcid});
        if(kcUser) {
          authorInfos[a].name = kcUser.username;
          newAuthInfos.push(authorInfos[a])
        }
      }
    }
  }
  // 发表评论时，更新上层post上的postCount字段（表示评论数量）
  let parentPostsId = [];
  if(parentPostId) {
    const parentPost = await PostModel.findOne({pid: parentPostId});
    if(parentPost) {
      parentPostsId = parentPost.parentPostsId.concat([parentPostId]);
      await PostModel.updateMany({pid: {$in: parentPostsId}}, {$inc: {postCount: 1}});
    }
  }
  // 创建post数据
  const IPModel = mongoose.model('ips');
  const ipToken = await IPModel.saveIPAndGetToken(ip);
  const ipAddr = await IPModel.getIpAddr(ip);
  const nowTime = Date.now();
  let _post = await new PostModel({
    toc: nowTime,
    tlm: nowTime,
    pid,
    c,
    t,
    abstractCn,
    abstractEn,
    keyWordsCn,
    keyWordsEn,
    authorInfos: newAuthInfos,
    originState,
    ipoc: ipToken,
    iplm: ipToken,
    addr: ipAddr,
    quote,
    l,
    mainForumsId: this.mainForumsId,
    minorForumsId: this.minorForumsId,
    tid: this.tid,
    parentPostsId,
    parentPostId,
    uid: user.uid,
    uidlm: user.uid
  });
  await _post.save();
  // 由于需要将部分信息（是否存在引用）带到路由，所有将post转换成普通对象
  _post = _post.toObject();
  await this.updateOne({
    lm: pid,
    tlm: nowTime
  });
  // 如果存在引用并且不需要审核，则给被引用者发送引用通知
  if(quotePost && _post.reviewed) {
    const messageId = await SettingModel.operateSystemID('messages', 1);
    const message = MessageModel({
      _id: messageId,
      r: quotePost.uid,
      ty: 'STU',
      c: {
        type: 'replyPost',
        targetPid: pid+'',
        pid: quotePost.pid+''
      }
    });

    await message.save();

    await socket.sendMessageToUser(message._id);
    // 如果引用作者的回复，则作者将只会收到 引用提醒
    if(quotePost.uid === this.uid) {
      _post.hasQuote = true;
    }
  }
  // 红包奖励判断
  await user.setRedEnvelope();
  return _post
};

 // 算post所在楼层
threadSchema.statics.getPostStep = async (tid, obj) => {
  const PostModel = mongoose.model('posts');
  const SettingModel = mongoose.model("settings");
  const pageSettings = await SettingModel.findOnly({_id: "page"});
  const perpage = pageSettings.c.threadPostList;
  const pid = obj.pid;
  const q = {
    tid,
    parentPostId: ""
  };
  if(obj.disabled === false) q.disabled = false;
  const posts = await PostModel.find(q, {pid: 1, _id: 0}).sort({toc: 1});
  let page, step;
  for (let i = 0; i < posts.length; i++) {
    if(posts[i].pid !== pid) continue;
    page = Math.ceil((i+1)/perpage) - 1;
    if(page < 0) page = 0;
    step = i;
    break;
  }
  return {
    page,// 页数
    step // 楼层
  }
};
threadSchema.methods.getStep = async function(obj) {
  return await mongoose.model("threads").getPostStep(this.tid, obj);
};

/* 拓展文章数组
  @param threads 文章对象数组
  @param options
      参数名                类型         默认值
      forum              Boolean        true     是否拓展专业
      parentForum        Boolean        true     是否拓展上级专业
      firstPost          Boolean        true     是否推展文章内容
      firstPostUser      Boolean        true     是否推展文章的用户
      lastPost           Boolean        true     是否推展最新回复
      lastPostUser       Boolean        true     是否推展最新回复的用户
  @return 文章对象数组
  @author pengxiguaa 2019/1/24
 */
const defaultOptions = {
  extendColumns: false,
  forum: true,
  category: false,
  firstPost: true,
  firstPostUser: true,
  userInfo: false,
  lastPost: true,
  lastPostUser: true,
  firstPostResource: false,
  htmlToText: false,
  count: 200,
  reviewReason: true,
  showAnonymousUser: false,
  excludeAnonymousPost: false,
  removeLink: true,
  threadCategory: true
};
threadSchema.statics.extendThreads = async (threads, options) => {
  const nkcRender = require('../nkcModules/nkcRender');
  const o = Object.assign({}, defaultOptions);
  Object.assign(o, options);
  let PostModel, UserModel, ForumModel, ThreadTypeModel, columnsModel;
  if(o.firstPost || o.lastPost) {
    PostModel = mongoose.model('posts');
    if(o.lastPostUser || o.firstPostUser) {
      UserModel = mongoose.model('users');
    }
  }

  if(o.extendColumns){
    columnsModel = mongoose.model('columns');
  }

  if(o.forum) {
    ForumModel = mongoose.model('forums');
  }
  if(o.category) {
    ThreadTypeModel = mongoose.model('threadTypes');
  }

  let forumsId = [];
  let postsId = new Set();
  let postsObj = {};
  let usersId = new Set();
  let usersObj = {};
  let cid = [];
  let tcId = [];
  let columnIds = [];
  const threadCategoryObj = {};
  const parentForumsId = new Set(), forumsObj = {}, categoryObj = {}, columnsObj = {};

  threads = threads.filter(thread => !!thread);

  threads.map(thread => {
    if(!thread) return;
    thread.tcId = thread.tcId || [];
    if(o.firstPost) {
      postsId.add(thread.oc);
    }
    if(o.extendColumns){
      thread.columns = [];
      columnIds = columnIds.concat(thread.columnsId);
      columnIds = [...new Set(columnIds)];
    }
    if(o.forum) {
      forumsId = forumsId.concat(thread.mainForumsId);
    }
    if(o.lastPost && thread.lm) postsId.add(thread.lm);
    if(thread.categoriesId && thread.categoriesId.length !== 0) {
      cid = cid.concat(thread.categoriesId);
    }
    if(o.threadCategory) {
      tcId = tcId.concat(thread.tcId || []);
    }
  });

  if(o.threadCategory) {
    const ThreadCategoryModel = mongoose.model('threadCategories');
    const threadCategories = await ThreadCategoryModel.getCategoriesById([...new Set(tcId)]);
    for(let i = 0; i < threadCategories.length; i++) {
      const {nodeId} = threadCategories[i];
      threadCategoryObj[nodeId] = threadCategories[i];
    }
  }

  if(o.firstPost || o.lastPost) {
    const posts = await PostModel.find({pid: {$in: [...postsId]}}, {
      pid: 1,
      t: 1,
      anonymous: 1,
      c: 1,
      abstract: 1,
      uid: 1,
      toc: 1,
      tlm: 1,
      l: 1,
      tid: 1,
      mainForumsId: 1,
      voteUp: 1,
      reviewed: 1,
      voteDown: 1,
      digest: 1,
      cover: 1,
      abstractCn: 1,
      disabled: 1,
      toDraft: 1,
    });
    posts.map(async post => {
      if(o.htmlToText) {
        post.c = obtainPureText(post.c, true, o.count);
      }
      if(o.firstPostUser || o.lastPostUser) {
        usersId.add(post.uid);
      }
      if(o.removeLink) {
        post.c = nkcRender.replaceLink(post.c);
        post.t = nkcRender.replaceLink(post.t);
        post.abstractCn = nkcRender.replaceLink(post.abstractCn);
        post.abstractEn = nkcRender.replaceLink(post.abstractEn);
      }

      postsObj[post.pid] = post;
    });

    if(o.firstPostUser || o.lastPostUser) {
      const users = await UserModel.find({uid: {$in: [...usersId]}}, {
        uid: 1,
        toc: 1,
        tlv: 1,
        avatar: 1,
        banner: 1,
        username: 1,
        xsf: 1,
        kcb: 1,
        description: 1,
        certs: 1,
        threadCount: 1,
        disabledThreadsCount: 1,
        disabledPostsCount: 1,
        postCount: 1
      });
      if(o.userInfo) {
        await UserModel.extendUsersInfo(users);
      }
      users.map(user => {
        usersObj[user.uid] = user;
      });
    }
  }

  if(o.extendColumns) {
    let columns = await columnsModel.find({_id: {$in:columnIds}});
    columns.map( column => {
      columnsObj[column._id] = column
    });
  }

  if(o.forum) {
    // let forums = await ForumModel.find({fid: {$in: [...new Set(forumsId)]}});
    let forums = await ForumModel.find({fid: {$in: [...new Set(forumsId)]}}, {
      fid: 1,
      displayName: 1,
      description: 1,
      forumType: 1,
      color: 1,
      parentsId: 1,
      logo: 1,
      banner: 1,
      iconFileName: 1
    });
    /* forums.map(forum => {
      if(forum.parentId) {
        if(o.parentForum) {
          parentForumsId.add(forum.parentId);
        }
      }
    }); */
    /* if(o.parentForum) {
      const parentForums = await ForumModel.find({fid: {$in: [...parentForumsId]}});
      forums = forums.concat(parentForums);
    } */
    forums.map(forum => {
      forumsObj[forum.fid] = forum;
    });

  }
  if(o.category) {
    const categories = await ThreadTypeModel.find({cid: {$in: [...new Set(cid)]}});
    for(const category of categories) {
      categoryObj[category.cid] = category;
    }
  }

  const results = [];
  for(const thread of threads) {
    thread.categories = [];
    if(o.firstPost) {
      const firstPost = postsObj[thread.oc];
      if(!firstPost) continue;
      if(firstPost.anonymous && o.excludeAnonymousPost) continue;
      if(o.firstPostUser) {
        let user;
        if(!o.showAnonymousUser && firstPost.anonymous) {
          thread.uid = "";
          firstPost.uid = "";
          firstPost.uidlm = "";
        } else {
          user = usersObj[firstPost.uid];
        }
        firstPost.user = user;
      }
      thread.firstPost = firstPost.toObject();
    }
    if(o.lastPost) {
      if(!thread.lm || thread.lm === thread.oc) {
        thread.lastPost = thread.firstPost;
      } else {
        const lastPost = postsObj[thread.lm];
        if(o.lastPostUser) {
          let user;
          if(!o.showAnonymousUser && lastPost.anonymous) {
            lastPost.uid = "";
            lastPost.uidlm = "";
          } else {
            user = usersObj[lastPost.uid];
          }
          lastPost.user = user;
        }
        thread.lastPost = lastPost.toObject();
      }

    }

    if(o.extendColumns) {
      const columns = [];
      for(const cid of thread.columnsId){
        const c = columnsObj[cid];
        if(c) columns.push(c);
      }
      thread.columns = columns;
      // console.log(thread.columns?true:false,thread.columns,thread);
    }

    if(o.forum) {
      const forums = [];
      for(const fid of thread.mainForumsId) {
        const f = forumsObj[fid];
        if(f) forums.push(f);
        // forums.push(forumsObj[fid]);
      }
      thread.forums = forums;
    }
    if(o.category) {
      if(thread.categoriesId && thread.categoriesId.length !== 0) {
        for(const cid of thread.categoriesId) {
          if(categoryObj[cid]) thread.categories.push(categoryObj[cid]);
        }
      }
    }
    if(o.threadCategory) {
      thread.threadCategories = [];
      for(let i = 0; i < thread.tcId.length; i++) {
        const id = thread.tcId[i];
        const category = threadCategoryObj[id];
        if(!category) continue;
        thread.threadCategories.push(category);
      }
    }
    results.push(thread.toObject?thread.toObject():thread);
  }
  return results;
};
/*
  通过tid查找文章
  @param tid: 文章id
  @author pengxiguaa 2019/3/7
*/
threadSchema.statics.findThreadById = async (tid) => {
  const ThreadModel = mongoose.model('threads');
  const thread = await ThreadModel.findOne({tid});
  if(!thread) throwErr(404, `未找到ID为【${tid}】的文章`);
  return thread;
};


/**
 * -------
 * 发表文章的权限判断
 * -------
 * @description ：根据用户等级、证书和身份认证等级，获取发表文章的条数限制和时间限制。
 *
 * @param {Object} options
 * @参数说明 options对象中必要参数
 * | uid      --  用户id
 * | fids     --  发表文章目标专业的fid数组集合，不可为空
 * | title    --  文章标题
 * | content  --  文章内容
 * | 其余未作说明的参数为非必要
 *
 * @return 无返回
 *
 * @author pengxiguaa 2019-03-07
 */
threadSchema.statics.ensurePublishPermission = async (options) => {
  const UserModel = mongoose.model('users');
  const ThreadModel = mongoose.model('threads');
  const SettingModel = mongoose.model('settings');
  const ForumModel = mongoose.model("forums");
  const apiFunction = require('../nkcModules/apiFunction');
  const {contentLength} = require("../tools/checkString");
  const {uid, fids, title, content} = options;

  if(!uid) throwErr(404, '用户ID不能为空');
  const user = await UserModel.findById(uid);
  await user.extendRoles();
  await user.extendGrade();
  const forums = await ForumModel.find({fid: {$in: fids}});
  await Promise.all(forums.map(async forum => {
    if(await SettingModel.isRecycle(forum.fid)) throwErr(400, '不允许在回收站专业发表内容');
    const childrenForums = await forum.extendChildrenForums();
    if(childrenForums.length !== 0) {
      throwErr(400, `专业【${forum.displayName}】下存在其他专业，请到下属属专业发表内容。`);
    }
  }));

  await ForumModel.ensureForumsPermission(fids, user);
  if(!title) throwErr(400, "标题不能为空");
  if(contentLength(title) > 200) throwErr(400, "标题不能大于200字节");
  if(!content) throwErr(400, "内容不能为空");
  if(contentLength(content) < 6) throwErr(400, "内容不能小于6个字节");

  // 验证是否完善过资料
  await user.ensureUserInfo();
  await user.extendAuthLevel();
  const postSettings = await SettingModel.findOnly({_id: 'post'});
  let {authLevelMin, exam} = postSettings.c.postToForum;
  authLevelMin = Number(authLevelMin);
  const {volumeA, volumeB, notPass} = exam;
  const {status, countLimit, unlimited} = notPass;
  const today = apiFunction.today();
  const todayThreadCount = await ThreadModel.countDocuments({toc: {$gt: today}, uid: user.uid});
  if(authLevelMin > user.authLevel) throwErr(403,`身份认证等级未达要求，发表文章至少需要完成身份认证 ${authLevelMin}`);
  if((!volumeB || !user.volumeB) && (!volumeA || !user.volumeA)) { // a, b考试未开启或用户未通过
    if(!status) throwErr(403, '权限不足，请提升账号等级');
    if(!unlimited && countLimit <= todayThreadCount) throwErr(403, '今日发表文章次数已用完，请明天再试。');
  }
  // 发表回复时间、条数限制
  const {postToForumCountLimit, postToForumTimeLimit} = await user.getPostLimit();
  if(todayThreadCount >= postToForumCountLimit) throwErr(400, `您当前的账号等级每天最多只能发表${postToForumCountLimit}篇文章，请明天再试。`);
  const latestThread = await ThreadModel.findOne({uid: user.uid, toc: {$gt: (Date.now() - postToForumTimeLimit * 60 * 1000)}});
  if(latestThread) throwErr(400, `您当前的账号等级限定发表文章间隔时间不能小于${postToForumTimeLimit}分钟，请稍后再试。`);
};
/*
  发表文章接口，未完成
  @param options
    uid: string 发表者ID
    fids: [String] 所著专业
    cids: [String] 文章分类
    ip: String 发表者ID
    title: String 标题
    content: String 内容
    abstractCn: String 摘要
  @author pengxiguaa 2019/3/7
*/
threadSchema.statics.publishArticle = async (options) => {
  const ThreadModel = mongoose.model('threads');
  const ForumModel = mongoose.model('forums');
  const PostModel = mongoose.model('posts');
  const SettingModel = mongoose.model('settings');
  const UserModel = mongoose.model('users');
  const {uid, fids, cids, ip, title, content, abstractCn, type, keyWordsCn} = options;
  if(!uid) throwErr(404, '用户ID不能为空');
  const user = await UserModel.findById(uid);
  // await ThreadModel.ensurePublishPermission(options);
  await ForumModel.checkWritePermission(options.uid, options.fids);
  const tid = await SettingModel.operateSystemID('threads', 1);
  const thread = ThreadModel({
    tid,
    categoriesId: cids,
    mainForumsId: fids,
    mid: user.uid,
    uid: user.uid,
    type: type === 'product'?'product': 'article'
  });
  await thread.save();
  const post = await PostModel.newPost({
    title,
    content,
    abstractCn,
    keyWordsCn,
    ip,
    uid,
    tid
  });
  await thread.updateOne({$set:{oc: post.pid, count: 1, hits: 1}});
  // // 判断该用户的文章是否需要审核，如果不需要审核则标记文章状态为：已审核
  // const needReview = await UserModel.contentNeedReview(thread.uid, "thread");
  // 自动送审
  const needReview = await db.ReviewModel.autoPushToReview(_post);
  if(!needReview) {
    await PostModel.updateOne({pid: post.pid}, {$set: {reviewed: true}});
    await ThreadModel.updateOne({tid: thread.tid}, {$set: {reviewed: true}});
  }
  return await ThreadModel.findThreadById(thread.tid);
};
/*
* 获取首页置顶文章
* */
threadSchema.statics.getHomeToppedThreads = async (fid = [], type) => {
  const homeSettings = await mongoose.model("settings").getSettings("home");
  const ThreadModel = mongoose.model("threads");
  const ArticleModel = mongoose.model('articles');
  const {htmlToPlain} = require("../nkcModules/nkcRender");
  let toppedThreadsId;
  if(type === 'latest') {
    toppedThreadsId = homeSettings.latestToppedThreadsId;
  } else if(type === 'community') {
    toppedThreadsId = homeSettings.communityToppedThreadsId;
  } else {
    toppedThreadsId = homeSettings.toppedThreadsId;
  }
  const threadsId = [];
  const articlesId = [];
  for(const t of toppedThreadsId) {
    const {type , id} = t;
    if(type === 'thread') {
      threadsId.push(id);
    } else if(type === 'article') {
      articlesId.push(id);
    }
  }
  let threads = await ThreadModel.find({
    tid: {$in: threadsId},
    mainForumsId: {$in: fid},
    disabled: false,
    recycleMark: {$ne: true},
    reviewed: true
  });
  const {normal} = await ArticleModel.getArticleStatus();
  let articles = await ArticleModel.find({
    _id: {$in: articlesId},
    status: normal,
  });
  const articlesObj = {};
  articles = await ArticleModel.getArticlesInfo(articles);
  articles.map(article => articlesObj[article._id] = article);
  threads = await ThreadModel.extendThreads(threads, {
    forum: true,
    category: false,
    lastPost: true,
    lastPostUser: true,
    htmlToText: true
  });
  const threadsObj = {};
  threads.map(thread => threadsObj[thread.tid] = thread);
  const results = [];
  toppedThreadsId.map(t => {
    const {type, id} = t;
    let thread;
    if(type === 'thread') {
      thread = threadsObj[id];
    } else if(type === 'article') {
      thread = articlesObj[id];
      thread.type = 'newArticle';
      thread.document.content = htmlToPlain(thread.document.content, 200);
      if(thread.column) thread.columns = [thread.column];
    }
    if(thread) results.push(thread);
  });
  return results;
};

/*
* 获取首页置顶文章 适配 articlesPanel 组件
* */
threadSchema.statics.getHomeToppedArticles = async (fid = []) => {
  const SettingModel = mongoose.model('settings');
  const homeSettings = await SettingModel.getSettings('home');
  const ThreadModel = mongoose.model('threads');
  const ArticleModel = mongoose.model('articles');
  const {normal} = await ArticleModel.getArticleStatus();
  const {toppedThreadsId} = homeSettings;
  const articlesId = [];
  const threadsId = [];
  for(const t of toppedThreadsId) {
    if(t.type === 'article') {
      articlesId.push(t.id);
    } else if(t.type === 'thread') {
      threadsId.push(t.id);
    }
  }
  let threads = await ThreadModel.find({
    tid: {$in: threadsId},
    mainForumsId: {$in: fid},
    disabled: false,
    recycleMark: {
      $ne: true
    },
    reviewed: true
  });
  threads = await ThreadModel.extendArticlesPanelData(threads);
  const threadsObj = {};
  for(const thread of threads) {
    threadsObj[thread.id] = thread;
  }
  let articles = await ArticleModel.find({
    _id: {
      $in: articlesId
    },
    status: normal
  });
  articles = await ArticleModel.extendArticlesPanelData(articles);
  const articlesObj = {};
  for(const article of articles) {
    articlesObj[article.id] = article;
  }
  const results = [];
  for(const t of toppedThreadsId) {
    if(t.type === 'article') {
      const article = articlesObj[t.id];
      if(article) {
        results.push(article);
      }
    } else if(t.type === 'thread') {
      const thread = threadsObj[t.id];
      if(thread) {
        results.push(thread);
      }
    }
  }
  return results;
}

threadSchema.statics.extendArticlesPanelData = async function(threads) {
  const ThreadModel = mongoose.model('threads');
  const SettingModel = mongoose.model('settings');
  const pageSettings = await SettingModel.getSettings('page');
  const tools = require('../nkcModules/tools');
  const anonymousUser = tools.getAnonymousInfo();
  const contentStatusTypes = {
    normal: 'normal',
    warning: 'warning',
    danger: 'danger',
    disabled: 'disabled',
  };
  threads = await ThreadModel.extendThreads(threads, {
    forum: true,
    category: true,
    lastPost: true,
    lastPostUser: true,
    htmlToText: true,
    removeLink: true,
  });
  const _threads = [];
  for(const thread of threads) {
    const {firstPost, lastPost} = thread;
    if(!firstPost) continue;
    let user;
    if(thread.anonymous) {
      user = {
        uid: '',
        username: anonymousUser.username,
        avatarUrl: anonymousUser.avatarUrl,
        homeUrl: ''
      }
    } else {
      user = {
        uid: thread.uid,
        username: firstPost.user.username,
        avatarUrl: tools.getUrl('userAvatar', firstPost.user.avatar),
        homeUrl: tools.getUrl('userHome', thread.uid)
      }
    }
    const content = {
      time: thread.toc,
      coverUrl: firstPost.cover? tools.getUrl('postCover', firstPost.cover): '',
      title: firstPost.t,
      digest: firstPost.digest,
      url: tools.getUrl('thread', thread.tid),
      abstract: firstPost.c,
      readCount: thread.hits,
      voteUpCount: firstPost.voteUp,
      replyCount: thread.count
    };
    const categories = [{
      type: 'forum',
      id: thread.forums[0].fid,
      name: thread.forums[0].displayName,
      url: tools.getUrl('forumHome', thread.forums[0].fid)
    }];
    let reply = null;
    if(lastPost && lastPost.pid !== firstPost.pid) {
      let rUser;
      if(lastPost.anonymous) {
        rUser = {
          uid: '',
          username: anonymousUser.username,
          avatarUrl: anonymousUser.avatarUrl,
          homeUrl: ''
        }
      } else {
        rUser = {
          uid: lastPost.uid,
          username: lastPost.user.username,
          avatarUrl: tools.getUrl('userAvatar', lastPost.user.avatar),
          homeUrl: tools.getUrl('userHome', lastPost.uid)
        }
      }
      reply = {
        user: rUser,
        content: {
          time: lastPost.toc,
          url: tools.getUrl('post', lastPost.pid),
          abstract: lastPost.c
        }
      };
    }
    let pages = [];
    const {threadPostList = 30} = pageSettings;
    for(let i = 0; i < thread.count; i += threadPostList) {
      const page = i / threadPostList;
      if(page === 0) {
        continue;
      }
      pages.push({
        name: page + 1,
        url: tools.getUrl('thread', thread.tid) + `?page=${page}`
      });
    }
    const pagesLength = pages.length;
    if(pagesLength >= 6) {
      pages = [
        pages[0],
        pages[1],
        {
          name: '...',
          url: ''
        },
        pages[pagesLength - 2],
        pages[pagesLength - 1]
      ];
    }
    const status = {
      type: contentStatusTypes.normal,
      desc: ''
    };
    if(!thread.reviewed) {
      status.type = contentStatusTypes.danger;
      status.desc = '审核中';
    } else if(thread.disabled) {
      status.type = contentStatusTypes.disabled;
      status.desc = '已屏蔽，仅自己可见';
    } else if(thread.recycleMark) {
      status.type = contentStatusTypes.warning;
      status.desc = '退修中，仅自己可见，修改后对所有人可见';
    }
    _threads.push({
      type: 'post',
      oc: thread.oc,
      id: thread.tid,
      pid: thread.oc,
      user,
      pages,
      content,
      categories,
      reply,
      status,
    });
  }
  return _threads;
}

/*
* 获取最新页置顶的文章
* */
threadSchema.statics.getLatestToppedThreads = async (fid) => {
  return await mongoose.model('threads').getHomeToppedThreads(fid, 'latest');
}
/*
* 获取社区置顶
* */
threadSchema.statics.getCommunityToppedThreads = async (fid) => {
  return await mongoose.model('threads').getHomeToppedThreads(fid, 'community');
}
/*
* 加载首页轮播图
* @param {[String]} fid 能够从中读取文章的专业ID
* @param
* @author pengxiguaa 2019-4-26
* */
threadSchema.statics.getAds = async (fid) => {
  const homeSettings = await mongoose.model("settings").getSettings("home");
  const ThreadModel = mongoose.model("threads");
  const apiFunction = require("../nkcModules/apiFunction");
  const {fixed, movable, fixedOrder, movableOrder} = homeSettings.ads;
  const homeAds = fixed.concat(movable);
  const threadsId = homeAds.map(a => a.tid);
  let threads = await ThreadModel.find({
    tid: {$in: threadsId}, mainForumsId: {$in: fid}, disabled: false, reviewed: true, recycleMark: {$ne: true}
  }, {tid: 1});
  const threadsObj = {};
  threads.map(thread => {
    threadsObj[thread.tid] = thread;
  });
  const ads = {
    movable: [],
    fixed: []
  };
  for(const ad of homeSettings.ads.movable) {
    const thread = threadsObj[ad.tid];
    if(thread) ads.movable.push(ad);
  }
  for(const ad of homeSettings.ads.fixed) {
    const thread = threadsObj[ad.tid];
    if(thread) ads.fixed.push(ad);
  }
  if(fixedOrder === "random") {
    const fixedIndex = apiFunction.getRandomNumber({
      count: ads.fixed.length < 6? ads.fixed.length: 6,
      min: 0,
      max: ads.fixed.length - 1>0?ads.fixed.length - 1:0,
      repeat: false
    });
    const fixedThread = [];
    fixedIndex.map(i => {
      fixedThread.push(ads.fixed[i])
    });
    ads.fixed = fixedThread;
  }
  if(movableOrder === "random") {
    const movableIndex = apiFunction.getRandomNumber({
      count: ads.movable.length,
      min: 0,
      max: ads.movable.length - 1,
      repeat: false
    });
    const movableThread = [];
    movableIndex.map(i => {
      movableThread.push(ads.movable[i])
    });
    ads.movable = movableThread;
  }
  return ads;
};
threadSchema.statics.getAdsFromCache = async () => {
  let ads = await redisClient.getAsync(`visitor:ads`);
  try {
    ads = JSON.parse(ads);
  } catch(err) {
    if(global.NKC.NODE_ENV !== "production") {
      console.log(err);
    }
    ads = [];
  }
  return ads || [];
};
/*
* 加载网站公告
* @param {[String]} fid 能够从中读取文章的专业ID
* @author pengxiguaa 2019-4-26
* */
threadSchema.statics.getNotice = async (fid) => {
  let homeSettings = await mongoose.model("settings").findById("home");
  const ThreadModel = mongoose.model("threads");
  const notice = [];
  for(const oc of homeSettings.c.noticeThreadsId) {
    const thread = await ThreadModel.findOne({oc, mainForumsId: {$in: fid}, disabled: false, reviewed: true});
    if(thread) notice.push(thread);
  }
  return await ThreadModel.extendThreads(notice, {
    forum: false,
    lastPost: false,
    category: false,
    firstPost: true,
    firstPostUser: true,
    userInfo: false,
    lastPostUser: false,
    firstPostResource: false,
    htmlToText: false,
  });
};
/*
* 加载指定专业内的精选文章 随机
* @param {[String]} fid 能够从中读取文章的专业ID
* @author pengxiguaa 2019-4-26
* */
threadSchema.statics.getFeaturedThreads = async (fid) => {
  const ThreadModel = mongoose.model("threads");
  const time = Date.now() - 15379200000;// 半年
  const threads = await ThreadModel.aggregate([
    {
      $match: {
        digest: true,
        mainForumsId: {
          $in: fid
        },
        toc: {
          $gte: new Date(time)
        },
        disabled: false,
        reviewed: true
      }
    },
    {
      $project: {
        tid: 1,
        toc: 1,
        oc: 1,
        mainForumsId: 1,
        uid: 1
      }
    },
    {
      $sample: {
        size: 3
      }
    }
  ]);
  const threads_ = await ThreadModel.aggregate([
    {
      $match: {
        digest: true,
        mainForumsId: {
          $in: fid
        },
        toc: {
          $lt: new Date(time)
        },
        disabled: false,
        reviewed: true
      }
    },
    {
      $project: {
        tid: 1,
        toc: 1,
        oc: 1,
        mainForumsId: 1,
        uid: 1
      }
    },
    {
      $sample: {
        size: 3
      }
    }
  ]);
  return await ThreadModel.extendThreads(threads.concat(threads_), {
    lastPost: false,
    category: false,
    htmlToText: true
  })
};
/*
* 获取最新原创文章，从最新的10篇里取3篇
* @param {[String]} 有权访问的专业的ID所组成的数组
* @return {[Object]} 文章对象组成的数组
* @author pengxiguaa 2019-12-24
* */
threadSchema.statics.getOriginalThreads = async (fid) => {
  const ThreadModel = mongoose.model("threads");
  const PostModel = mongoose.model("posts");
  const posts = await PostModel.find({
    mainForumsId: {$in: fid},
    disabled: false,
    reviewed: true,
    toDraft: {$ne: true},
    type: "thread",
    originState: {$nin: ["0", "", "1", "2"]}
  }, {tid: 1, pid: 1}).sort({toc: -1}).limit(10);
  // const {getRandomNumber$2: getRandomNumber} = require("../nkcModules/apiFunction");
  /*const numbers = getRandomNumber({
    min: 0,
    max: posts.length - 1,
    count: 10,
    repeat: false
  });*/
  // const threadsId = numbers.map(n => posts[n].tid);
  const threadsId = posts.map(p => p.tid);
  const threads = await ThreadModel.find({
    tid: {$in: threadsId},
    mainForumsId: {$in: fid}, disabled: false, reviewed: true, recycleMark: {$ne: true}
  }).sort({toc: -1});
  return await ThreadModel.extendThreads(threads, {
    lastPost: true,
    lastPostUser: true,
    category: true,
    forum: true,
    firstPost: true,
    firstPostUser: true,
    userInfo: false,
    firstPostResource: false,
    htmlToText: true
  });
};
/*
* 获取全站最新文章
* @param {[String]} fid 能够从中读取文章的专业ID
* @param {String} sort 排序，toc: 文章的发表时间，tlm: 文章最后被回复的时间
* @param {Number} limit 条数，
* @author pengxiguaa 2019-4-26
* */
threadSchema.statics.getLatestThreads = async (fid, sort = "toc", limit = 9) => {
  const ThreadModel = mongoose.model("threads");
  const PostModel = mongoose.model("posts");
  const posts = await PostModel.find({
    mainForumsId: {$in: fid},
    disabled: false,
    reviewed: true,
    toDraft: {$ne: true},
    type: "thread",
    originState: {$nin: ["0", "", "1", "2"]}
  }).sort({toc: -1}).limit(limit);
  const sortObj = {};
  sortObj[sort] = -1;
  const threads = await ThreadModel.find({
    tid: {$in: posts.map(p => p.tid)},
    mainForumsId: {$in: fid}, disabled: false, reviewed: true
  }).sort(sortObj);
  return await ThreadModel.extendThreads(threads, {
    lastPost: true,
    lastPostUser: true,
    category: true,
    forum: true,
    firstPost: true,
    firstPostUser: true,
    userInfo: false,
    firstPostResource: false,
    htmlToText: true
  });
};
/*
* 获取"推荐文章列表"的查询条件
* @param {[String]} fid 能够从中读取文章的专业ID
* @author pengxiguaa 2019-4-26
* */
threadSchema.statics.getRecommendMatch = async (fid) => {
  const SettingModel = mongoose.model("settings");
  const homeSettings = await SettingModel.getSettings('home');
  const {featuredThreads, hotThreads, voteUpTotal, voteUpMax, encourageTotal} = homeSettings.recommend;

  const match = {
    disabled: false,
    reviewed: true,
    recycleMark: {$ne: true},
    mainForumsId: {$in: fid},
    $or: [
      {
        voteUpTotal: {
          $gte: voteUpTotal
        }
      },
      {
        voteUpMax: {
          $gte: voteUpMax
        }
      },
      {
        encourageTotal: {
          $gte: encourageTotal
        }
      }
    ]
  };

  if(hotThreads) {
    match.$or.push({
      count: {
        $gte: homeSettings.hotThreads.postCount+1
      },
      replyUserCount: {
        $gte: homeSettings.hotThreads.postUserCount+1
      }
    });
  }

  if(featuredThreads) {
    match.$or.push({
      digest: true
    });
  }
  return match;
};
/*
* 加载用户发表的文章
* @param {String} uid 用户ID
* @param {[String]} fid 能够从中读取文章的专业ID
* */
threadSchema.statics.getUserThreads = async (uid, fid) => {
  const ThreadModel = mongoose.model("threads");
  const threads = await ThreadModel.find({
    mainForumsId: {
      $in: fid
    },
    reviewed: true,
    disabled: false,
    recycleMark: {
      $ne: true
    },
    uid
  }).sort({toc: -1}).limit(10);
  return await ThreadModel.extendThreads(threads, {
    lastPost: false,
    category: false
  });
};
/*
* 加载最新的10篇关注的文章
* @param {String} uid 用户ID
* @param {[String]} fid 能够从中读取文章的专业ID
* */
threadSchema.statics.getUserSubThreads = async (uid, fid) => {
  const SubscribeModel = mongoose.model("subscribes");
  const ThreadModel = mongoose.model("threads");
  const subs = await SubscribeModel.find({cancel: false, uid}, {
    fid: 1,
    tid: 1,
    tUid: 1,
    type: 1
  }).sort({toc: -1});
  const subFid = [], subTid = [], subUid = [];
  subs.map(s => {
    if(s.type === "forum") subFid.push(s.fid);
    if(s.type === "thread") subTid.push(s.tid);
    if(s.type === "user") subUid.push(s.tUid);
  });
  const q = {
    mainForumsId: {
      $in: fid
    },
    recycleMark: {
      $ne: true
    },
    disabled: false,
    reviewed: true,
    $or: [
      {
        mainForumsId: {
          $in: subFid
        }
      },
      {
        uid
      },
      {
        uid: {
          $in: subUid
        }
      },
      {
        tid: {
          $in: subTid
        }
      }
    ]
  };
  const threads = await ThreadModel.find(q).sort({toc: -1}).limit(10);
  return await ThreadModel.extendThreads(threads, {
    lastPost: false,
    category: false
  });
};
/*
* 加载最新10篇推荐文章
* @param {[String]} fid 能够从中读取文章的专业ID
* */
threadSchema.statics.getRecommendThreads = async (fid) => {
  const ThreadModel = mongoose.model("threads");
  const match = await ThreadModel.getRecommendMatch(fid);
  const threads = await ThreadModel.find(match).sort({tlm: -1}).limit(10);
  return await ThreadModel.extendThreads(threads, {
    lastPost: false,
    category: false,
    forum: true,
    firstPost: true,
    firstPostUser: true,
    userInfo: false,
    lastPostUser: false,
    firstPostResource: false,
    htmlToText: true
  });
};

/*
* 将退修超时的文章移动到回收站
* @author pengxiguaa 2020-1-6
* */
threadSchema.statics.moveRecycleMarkThreads = async () => {
  const ThreadModel = mongoose.model("threads");
  const ForumModel = mongoose.model("forums");
  const DelPostLogModel = mongoose.model("delPostLog");
  const UserModel = mongoose.model("users");
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const SettingModel = mongoose.model('settings');
  const recycleId = await SettingModel.getRecycleId();
  const nkcModules = require("../nkcModules");
  // 删除退修超时的帖子
  // 取出全部被标记的帖子
  const allMarkThreads = await ThreadModel.find({ "recycleMark": true});
  let forumsId = [];
  for(const thread of allMarkThreads) {
    // 被退休的文章在delPostLogs中会生成一条记录，根据此记录判断是否超时
    const delThreadLog = await DelPostLogModel.findOne({
      postType: "thread",
      threadId: thread.tid,
      toc: {$lt: Date.now() - 3 * 24 * 60 * 60 * 1000}
    });
    // 未超时则忽略
    if(!delThreadLog) continue;
    // 将文章移动到回收站
    const _threadMainForumsId = thread.mainForumsId;
    forumsId = forumsId.concat(thread.mainForumsId);
    await thread.updateOne({
      recycleMark: false,
      mainForumsId: [recycleId],
      disabled: true,
      reviewed: true,
      categoriesId: []
    });
    // 更新文章信息（将文章下所有post的mainForumsId改为["recycle"]）
    await thread.updateThreadMessage();
    // 标记为已移动到回收站
    await delThreadLog.updateOne({
      delType: "toRecycle"
    });
    const tUser = await UserModel.findOne({uid: thread.uid});

    // 文章被删，触发科创币加减
    if(tUser) {
      await KcbsRecordModel.insertSystemRecord('threadBlocked', tUser, {
        state: {
          _scoreOperationForumsId: _threadMainForumsId
        },
        data: {
          user: {},
          thread
        },
        nkcModules,
        db: require("./index")
      });
    }
  }
};


/**
 * -------
 * 发帖
 * -------
 * @description ：使用该方法可新生成一篇文章，包含thread、post等新数据。
 *
 * @param {Object} options
 * @参数说明 options对象中必要参数
 * | type  --  用于区别文章类型，product、article等
 * | ip    --  用户ip
 * | c     --  文章主题内容content
 * | t     --  文章标题
 * | uid   --  发表文章的用户ID
 * | fids  --  发表文章目标专业的fid数组集合，不可为空
 * | cids  --  发表文章目标专业的分类集合，可为空，但不可为undefined
 * | 其余未作说明的参数为非必要
 *
 * @return {Object} _post 返回一个包含pid、tid等的post，便于后续的业务逻辑中使用
 */
threadSchema.statics.postNewThread = async (options) => {
  const UserModel = mongoose.model("users");
  const ForumModel = mongoose.model("forums");
  const ThreadModel = mongoose.model("threads");
  const PostModel = mongoose.model("posts");
  const MessageModel = mongoose.model("messages");
  const DraftModel = mongoose.model("drafts");
  const ReviewModel = mongoose.model("reviews");
  // 检测专业ID
  await ForumModel.checkForumCategoryBeforePost(options.fids);
  // 1.检测发表权限
  // await ThreadModel.ensurePublishPermission(options);
  await ForumModel.checkWritePermission(options.uid, options.fids);
  // 2.生成一条新的thread，并返回post
  const _post = await ForumModel.createNewThread(options);
  // 获取当前的thread
  const thread = await ThreadModel.findOnly({tid: _post.tid});
  // 是否需要审核
  // let needReview =
  //     await UserModel.contentNeedReview(options.uid, "thread")  // 判断该用户是否需要审核，如果不需要审核则标记文章状态为：已审核
  //   || await ReviewModel.includesKeyword(_post);                // 文章内容是否触发了敏感词送审条件
  // 自动送审
  const needReview = await ReviewModel.autoPushToReview(_post);
  if(!needReview) {
    _post.reviewed = true;
    thread.reviewed = true;
    await PostModel.updateOne({pid: _post.pid}, {$set: {reviewed: true}});
    await ThreadModel.updateOne({tid: thread.tid}, {$set: {reviewed: true}});
  }else{
    // await MessageModel.sendReviewMessage(_post.pid);
  }
  // 发贴自动关注专业
  // await SubscribeModel.autoAttentionForum(options);
  // 发表文章删除草稿
  // 取消删除草稿
  // if(options.did) {
  //   await DraftModel.removeDraftById(options.did, options.uid);
  // }
  return _post;
};


/**
 * -------
 * 创建一条post
 * -------
 * @description ：使用该方法可新生成一条回复。
 *
 * @param {Object} options
 * @参数说明 options对象中必要参数
 * | ip    --  用户ip
 * | c     --  回复主体内容
 * | t     --  回复标题
 * | uid   --  发表文章的用户ID
 * | 其余未作说明的参数为非必要
 *
 * @return {Object} _post 返回一个包含pid、tid等的post，便于后续的业务逻辑中使用
 */
threadSchema.methods.createNewPost = async function(post) {
  const SettingModel = mongoose.model('settings');
  const PostModel = mongoose.model('posts');
  const socket = require('../nkcModules/socket');
  const MessageModel = mongoose.model('messages');
  const UserModel = mongoose.model('users');
  const UserGeneralModel = mongoose.model("usersGeneral");
  const IPModel = mongoose.model('ips');
  const ReplyModel = mongoose.model('replies');
  const dbFn = require('../nkcModules/dbFunction');
  const apiFn = require('../nkcModules/apiFunction');
  const pid = await SettingModel.operateSystemID('posts', 1);
  const {
    postType,
    cover = "",
    c,
    t,
    l,
    abstractCn,
    abstractEn,
    keyWordsCn,
    keyWordsEn,
    authorInfos=[],
    originState,
    tcId,
  } = post;
  let newAuthInfos = [];
  if(authorInfos) {
    for(let a = 0;a < authorInfos.length;a++) {
      if(authorInfos[a].name.length > 0) {
        newAuthInfos.push(authorInfos[a])
      }else{
        let kcUser = await UserModel.findOne({uid: authorInfos[a].kcid});
        if(kcUser) {
          authorInfos[a].name = kcUser.username;
          newAuthInfos.push(authorInfos[a])
        }
      }
    }
  }
  const quote = await dbFn.getQuote(c);
  if(this.uid !== post.uid) {
    const replyWriteOfThread = new ReplyModel({
      fromPid: pid,
      toPid: this.oc,
      toUid: this.uid
    });
    await replyWriteOfThread.save();
  }
  let rpid = [];
  if(quote && quote[2]) {
    rpid.push(quote[2]);
  }
  const ipToken = await IPModel.saveIPAndGetToken(post.ip);
  const ipAddr = await IPModel.getIpAddr(post.ip);
  let _post = await new PostModel({
    cover,
    pid,
    c,
    t,
    abstractCn,
    abstractEn,
    keyWordsCn,
    keyWordsEn,
    authorInfos: newAuthInfos,
    originState,
    ipoc: ipToken,
    iplm: ipToken,
    l,
    tcId,
    addr: ipAddr,
    mainForumsId: this.mainForumsId,
    minorForumsId: this.minorForumsId,
    tid: this.tid,
    uid: post.uid,
    uidlm: post.uid,
    surveyId: post.surveyId || null,
    type: postType,
    rpid
  });
  if(!this.oc) await this.updateOne({oc: pid});
  await _post.save();
  // 由于需要将部分信息（是否存在引用）带到路由，所有将post转换成普通对象
  _post = _post.toObject();
  await this.updateOne({
    lm: pid,
    tlm: Date.now()
  });
  if(quote && quote[2] !== this.oc) {
    const quPid = quote[2];
    const quPost = await PostModel.findOne({pid: quPid});
    if(quPost && _post.reviewed) {
      const reply = new ReplyModel({
        fromPid: pid,
        toPid: quPid,
        toUid: quPost.uid
      });
      await reply.save();
      const messageId = await SettingModel.operateSystemID('messages', 1);
      const message = MessageModel({
        _id: messageId,
        r: quPost.uid,
        ty: 'STU',
        c: {
          type: 'replyPost',
          targetPid: pid+'',
          pid: quPid+''
        }
      });

      await message.save();
      await socket.sendMessageToUser(message._id);
      // 如果引用作者的回复，则作者将只会收到 引用提醒
      if(quPost.uid === this.uid) {
        _post.hasQuote = true;
      }

    }
  }
  await this.updateOne({lm: pid});
  // 红包奖励判断
  const user = await UserModel.findOnly({uid: post.uid});
  await user.setRedEnvelope();
  /*const userGeneral = await UserGeneralModel.findOne({uid: post.uid});
  if(!userGeneral.lotterySettings.close) {
    const redEnvelopeSettings = await SettingModel.findOnly({_id: 'redEnvelope'});
    if(!redEnvelopeSettings.c.random.close) {
      const {chance} = redEnvelopeSettings.c.random;
      const number = Math.ceil(Math.random()*100);
      if(number <= chance) {
        const postCountToday = await PostModel.countDocuments({uid: post.uid, toc: {$gte: apiFn.today()}});
        if(postCountToday === 1) {
          await userGeneral.updateOne({'lotterySettings.status': true});
        }
      }
    }
  }*/
  return _post
};
/*
* 检验用户是否为文章所在专业的专家
* @param {String/Object} uid 用户ID或对象
* @param {String} type "or": 只需是其中一个专业的专家，"and": 必须是所有专业的和专家
* @return {Boolean} 是否为专家
* @author pengxiguaa 2019-7-10
* */
threadSchema.methods.isModerator = async function(uid, type) {
  const UserModel = mongoose.model("users");
  let user;
  if(typeof uid === "string") {
    user = await UserModel.findOnly({uid});
  } else {
    user = uid;
  }
  const forums = await this.extendForums(["mainForums"]);
  if(type === "or") {
    for(const forum of forums) {
      if(await forum.isModerator(user)) return true;
    }
    return false;
  } else {
    for(const forum of forums) {
      if(!await forum.isModerator(user)) return false;
    }
    return true;
  }
};

/*
* 更新首页自动推荐数据
* @author pengxiguaa 2020/7/15
* */
threadSchema.statics.updateAutomaticRecommendThreadsByType = async (type) => {
  const ThreadModel = mongoose.model('threads');
  const SettingModel = mongoose.model('settings');
  const homeSettings = await SettingModel.getSettings('home');
  const {fixed, movable} = homeSettings.recommendThreads;
  let exception = [];
  if(type === 'fixed') {
    exception = movable.manuallySelectedThreads
      .concat(
        movable.automaticallySelectedThreads,
        fixed.manuallySelectedThreads,
      );
  } else {
    exception = fixed.manuallySelectedThreads
      .concat(
        fixed.automaticallySelectedThreads,
        movable.manuallySelectedThreads
      );
  }
  exception = exception.map(e => e.tid);
  await ThreadModel.updateHomeRecommendThreadsByType(type, exception);
};
/*
* 更新指定类型的首页推荐文章
* @param {String} type fixed: 固定推荐, movable: 滚动推荐
* @param {[String]} excludedThreadsId 需要排除的threadID
* @return {[Object]}
*   @param {String} tid 文章ID
*   @param {String} title 文章标题
*   @param {String} cover 文章封面
* @author pengxiguaa 2020/7/15
* */
threadSchema.statics.updateHomeRecommendThreadsByType = async (type, excludedThreadsId = []) => {
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const ForumModel = mongoose.model('forums');
  const SettingModel = mongoose.model('settings');
  const ComplaintModel = mongoose.model('complaints');
  const homeSettings = await SettingModel.getSettings('home');
  if(!['fixed', 'movable'].includes(type)) throwErr(500, `推荐类型错误 type: ${type}`);
  // 去除自动推荐相关的条件
  const {
    automaticCount, countOfPost,
    timeOfPost, digest, postVoteUpMinCount, postVoteDownMaxCount, otherThreads,
    threadVoteUpMinCount, reportedAndUnReviewed, original, flowControl
  } = homeSettings.recommendThreads[type];
  const match = {
    type: 'thread',
    cover: {$ne: ''},
    tid: {$nin: excludedThreadsId},
    disabled: false,
    toRecycle: {$ne: true},
    toc: {
      $gte: new Date(Date.now() - (timeOfPost.max * 24 * 60 * 60 * 1000)),
      $lte: new Date(Date.now() - (timeOfPost.min * 24 * 60 * 60 * 1000))
    },
    threadPostCount: {
      $gte: countOfPost.min,
      $lte: countOfPost.max
    },
    voteUpTotal: {$gte: threadVoteUpMinCount},
    voteUp: {$gte: postVoteUpMinCount},
    voteDown: {$lte: postVoteDownMaxCount},
  };

  // 被举报但未处理的文章ID
  const complaints = await ComplaintModel.find({type: 'thread'}, {contentId: 1});
  const threadsId = complaints.map(c => c.contentId);

  const or = [];
  const and = [];

  // 其他文章
  if(otherThreads) {
    or.push({
      digest: false,
      originState: {$nin: ['4', '5', '6']},
      tid: {$nin: threadsId},
      flowControl: false
    });
  }

  // 流控文章
  if(flowControl) {
    or.push({
      flowControl: true
    });
  } else {
    and.push({
      flowControl: false
    });

    // 获取被流控的专业
    const forums = await ForumModel.find({openReduceVisits: true}, {fid: 1});
    const forumsId = forums.map(f => f.fid);
    and.push({
      mainForumsId: {$nin: forumsId}
    });
  }
  // 是否精选
  if(digest) {
    or.push({
      digest: true
    });
  } else {
    and.push({
      digest: false
    });
  }
  // 是否必须为原创
  if(original) {
    or.push({
      originState: {$in: ['4', '5', '6']}
    });
  } else {
    and.push({
      originState: {$nin: ['4', '5', '6']}
    });
  }
  // 排除被举报但未被处理的文章
  if(reportedAndUnReviewed) {
    or.push({
      tid: {$in: threadsId}
    });
  } else {
    and.push({
      tid: {$nin: threadsId}
    });
  }

  if(or.length) {
    and.push({$or: or});
  }
  match.$and = and;

  const posts = await PostModel.aggregate([
    {
      $match: match
    },
    {
      $group: {
        _id: '$pid'
      }
    },
    {
      $sample: {
        size: automaticCount * 2
      }
    }
  ]);
  let threads = await ThreadModel.find({
    oc: {$in: posts.map(p => p._id)},
    disabled: false,
  });
  threads = threads.slice(0, automaticCount);
  threads = await ThreadModel.extendThreads(threads);
  const arr = [];
  for(const thread of threads) {
    arr.push({
      title: thread.firstPost.t,
      tid: thread.tid,
      cover: thread.firstPost.cover,
      type: 'automatic'
    });
  }
  const obj = {};
  obj[`c.recommendThreads.${type}.automaticallySelectedThreads`] = arr;
  await SettingModel.updateOne({_id: 'home'}, {
    $set: obj
  });
  await SettingModel.saveSettingsToRedis('home');
  return arr;
};
/*
* 获取首页推荐文章
* */
threadSchema.statics.getHomeRecommendThreadsByType = async (type, fid = []) => {
  if(!['fixed', 'movable'].includes(type)) throwErr(500, `推荐文章类型错误 type: ${type}`);
  const SettingModel = mongoose.model('settings');
  const apiFunction = require('../nkcModules/apiFunction');
  const homeSettings = await SettingModel.getSettings('home');
  const ThreadModel = mongoose.model('threads');
  const options = homeSettings.recommendThreads[type];
  let {
    displayType, order, manuallySelectedThreads,
    automaticallySelectedThreads, automaticProportion,
    count
  } = options;
  let threadsId = manuallySelectedThreads.concat(
    automaticallySelectedThreads
  );
  threadsId = threadsId.map(t => t.tid);
  const threads = await ThreadModel.find({tid: {$in: threadsId}, mainForumsId: {$in: fid}}, {tid: 1});
  const threadsObj = {};
  threads.map(thread => {
    threadsObj[thread.tid] = true;
  });
  manuallySelectedThreads = manuallySelectedThreads.filter(t => threadsObj[t.tid]);
  automaticallySelectedThreads = automaticallySelectedThreads.filter(t => threadsObj[t.tid]);
  let results = [];
  if(displayType === 'manual') {
    // 只从手动推荐文章中选取
    if(order === 'random') {
      manuallySelectedThreads = apiFunction.arrayShuffle(manuallySelectedThreads);
    }
    results = manuallySelectedThreads.slice(0, count);
  } else if(displayType === 'automatic') {
    // 只从自动推荐文章中选取
    if(order === 'random') {
      automaticallySelectedThreads = apiFunction.arrayShuffle(automaticallySelectedThreads);
    }
    results = automaticallySelectedThreads.slice(0, count);
  } else {
    // 根据比例从手动和自动推荐文章中选取
    const automaticCount = Math.round(count * automaticProportion / (automaticProportion + 1));
    const manualCount = count - automaticCount;
    if(order === 'random') {
      manuallySelectedThreads = apiFunction.arrayShuffle(manuallySelectedThreads);
      automaticallySelectedThreads = apiFunction.arrayShuffle(automaticallySelectedThreads);
    }
    results = manuallySelectedThreads.slice(0, manualCount).concat(
      automaticallySelectedThreads.slice(0, automaticCount)
    );
    if(order === 'random') {
      results = apiFunction.arrayShuffle(results);
    }
  }
  return results;
};
threadSchema.statics.getHomeRecommendThreads = async (fid) => {
  const ThreadModel = mongoose.model('threads');
  return {
    fixed: await ThreadModel.getHomeRecommendThreadsByType('fixed', fid),
    movable: await ThreadModel.getHomeRecommendThreadsByType('movable', fid)
  };
};


/*
* 获取文章页顶部的导航链接
* @return {[Object]}
*   object.fid: 专业ID
*   object.cid: 文章分类ID
*   object.name: 专业名或文章分类名
* @author pengxiguaa 2020/8/31
* */
threadSchema.methods.getThreadNav = async function() {
  const {mainForumsId, categoriesId} = this;
  const ForumModel = mongoose.model('forums');
  const ThreadTypeModel = mongoose.model('threadTypes');
  let forums = [];
  const getParentForum = async (arr) => {
    for(const fid of arr) {
      const f = await ForumModel.getForumByIdFromRedis(fid);
      if(!f) continue;
      forums.unshift({
        fid: f.fid,
        name: f.displayName
      });
      getParentForum(f.parentsId);
    }
  };
  await getParentForum([mainForumsId[0]]);
  if(forums.length) {
    const mainForum = forums[forums.length - 1];
    const category = await ThreadTypeModel.findOne({cid: {$in: categoriesId}, fid: mainForum.fid}).sort({order: 1});
    if(category) {
      forums.push({
        fid: mainForum.fid,
        cid: category.cid,
        name: category.name
      });
    }
  }
  return forums;
}

/*
* 获取文章的收藏数
* @param {String} tid 文章ID
* @return {Number}
* @author pengxiguaa 2020/8.31
* */
threadSchema.statics.getCollectedCountByTid = async (tid) => {
  const SubscribeModel = mongoose.model('subscribes');
  return await SubscribeModel.countDocuments({
    type: 'collection',
    cancel: false,
    tid
  });
};

/*
* 拓展文章属性
* */
threadSchema.methods.extendThreadCategories = async function() {
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const threadCategories = await ThreadCategoryModel.getCategoriesById(this.tcId);
  const threadCategoriesWarning = [];
  for(const tc of threadCategories) {
    if(tc.categoryThreadWarning) {
      threadCategoriesWarning.push(tc.categoryThreadWarning);
    }
    if(tc.nodeThreadWarning) {
      threadCategoriesWarning.push(tc.nodeThreadWarning);
    }
  }
  this.threadCategoriesWarning = threadCategoriesWarning;
  return this.threadCategories = threadCategories;
};

/*
* 根据专栏引用获取文章thread信息
* */
threadSchema.statics.getThreadInfoByColumn = async function(columnPost) {
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const UserModel = mongoose.model('users');
  const ColumnModel = mongoose.model('columns');
  const ColumnPostCategoryModel = mongoose.model('columnPostCategories');
  const ResourceModel = mongoose.model('resources');
  const {getUrl} = require('../nkcModules/tools');
  const {tid, pid, columnId, cid, mcid} = columnPost;
  // thread 中 包括需要的 回复数 观看数
  let thread = await ThreadModel.findThreadById(tid);
  thread = thread.toObject()
  // 文章主体内容
  let post = await PostModel.getPostByPid(pid)
  post = post.toObject()
  // 查找用户
  let user = await UserModel.findOne({uid: post.uid})
  user = user.toObject()
  // 收藏数
  let collect = await ThreadModel.getCollectedCountByTid(tid)
  //获取专栏名和id
  let column = await ColumnModel.findOne({_id: columnId})
  column = column.toObject()
  // 获取当前专栏下一篇文章的分类及其父级
  const mainCategory = await ColumnPostCategoryModel.getParentCategoryByIds(cid)
  const auxiliaryCategory = await ColumnPostCategoryModel.getMinorCategories(columnId, mcid)
  //获取文章的链接
  const url = getUrl('thread', thread.tid);
  //获取引用的所有资源
  const resources = await ResourceModel.getResourcesByReference(pid);
  return {
    _id: columnPost._id,
    thread,
    article:post,
    column,
    collectedCount: collect,
    resources,
    user,
    mainCategory,
    auxiliaryCategory,
    type: columnPost.type,
    url,
  };
}


threadSchema.statics.extendShopInfo = async function(praps) {
  const ShopGoodsModel = mongoose.model('shopGoods');
  // const ShopCartModel = mongoose.model('shopCarts');
  const IPModel = mongoose.model('ips');
  // const UserModel = mongoose.model('users');
  const SettingModel = mongoose.model('settings');
  const {tid, oc, uid, authLevel, address} = praps;

  let product = null;
  let vipDiscount = false;
  let vipDisNum = 0;
  let userAddress = "";
  let closeSaleDescription = '';

  const products = await ShopGoodsModel.find({tid: tid, oc: oc});
  let productArr = await ShopGoodsModel.extendProductsInfo(products);
  product = productArr[0];
  // 判断是否使用会员价
  let vipNum = 100;
  if(product.vipDiscount) {
    vipDiscount = true;
    for(let v = 0; v < product.vipDisGroup.length; v ++) {
      if(uid && Number(authLevel) === Number(product.vipDisGroup[v].vipLevel)) {
        vipNum = product.vipDisGroup[v].vipNum;
      }
    }
    vipDisNum = vipNum;
  }else{
    vipDiscount = false;
    vipDisNum = vipNum;
  }
  /*// 选定规格
  let paId = 0;
  for(let a = 0; a < product.productParams.length; a ++){
    if(paraId === product.productParams[a]._id){
      paId = a;
    }
  }
  data.paId = paId;
  data.paraId = paraId;*/

  /*if(uid) {
    data.shopInfo = {
      cartProductCount: await ShopCartModel.getProductCount(uid)
    }
  }*/
  // 获取用户地址信息
  if(uid){
    try{
      const ipInfo = await IPModel.getIPInfoByIP(address);
      userAddress = ipInfo.location;
    } catch(err) {}
  }
  try{
    await SettingModel.checkShopSellerByUid(product.uid);
  } catch(err) {
    closeSaleDescription = err.message || err.stack || err.toString();
  }
  return {
    closeSaleDescription,
    userAddress,
    product,
    vipDiscount,
    vipDisNum,
    paId: 0,
  }
}

threadSchema.statics.extendFundInfo = async function(props) {
  const {tid, uid, accessForumsId, displayFundApplicationFormSecretInfoPermission = false} = props;
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const SettingModel = mongoose.model('settings');
  const FundBlacklistModel = mongoose.model('fundBlacklist')
  const applicationForm = await FundApplicationFormModel.findOnly({tid});
  await applicationForm.extendApplicationFormBaseInfo(uid);
  await applicationForm.extendApplicationFormInfo(uid, accessForumsId);
  const fundSettings = await SettingModel.getSettings('fund');
  const fund = applicationForm.fund;
  const fundName = fundSettings.fundName;
  const userFundRoles = await fund.getUserFundRoles(uid);
  const targetUserInFundBlacklist = await FundBlacklistModel.inBlacklist(applicationForm.uid);
  await applicationForm.hideApplicationFormInfoByUserId(uid, displayFundApplicationFormSecretInfoPermission);
  const auditComments = applicationForm.auditComments;
  const _applicationForm = applicationForm.toObject();
  _applicationForm.auditComments = auditComments;
  return {
    applicationForm: _applicationForm,
    fund,
    fundName,
    userFundRoles,
    targetUserInFundBlacklist,
  }
}

/*
* 清除文章内所有资源的权限缓存
* */
threadSchema.statics.clearThreadResourcesForumCache = async function(tid) {
  const PostModel = mongoose.model('posts');
  const ResourceModel = mongoose.model('resources');
  const posts = await PostModel.find({tid}, {pid: 1});
  const postsId = posts.map(post => post.pid);
  await ResourceModel.updateMany({references: {$in: postsId}}, {
    $set: {
      tou: null
    }
  });
}

module.exports = mongoose.model('threads', threadSchema);

