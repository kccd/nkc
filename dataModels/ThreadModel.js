const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const apiFunction = require('../nkcModules/apiFunction');
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
  mid: {
    type: String,
    required: true
  },
  hasCover: {
    type: Boolean,
    default: true
  },
  recycleMark: {
    type: Boolean,
	  index: 1,
    default: false
  },
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
  toMid: {
    type: String,
    default: ''
  },
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
threadSchema.virtual('reason')
	.get(function() {
		return this._reason
	})
	.set(function(reason) {
		this._reason = reason;
	});
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
  return this.forums = forums;
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
  for(const forum of this.forums) {
    await forum.ensurePermission(roles, grade, user);
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
  await this.update(updateObj);
};
/*
* 更新文章的鼓励数量
* */
threadSchema.methods.updateThreadEncourage = async function() {
  const PostModel = mongoose.model('posts');
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const posts = await PostModel.find({tid: this.tid}, {pid: 1});
  const pid = posts.map(p => p.pid);
  const encourageTotal = await KcbsRecordModel.count({type: "creditKcb", pid: {$in: pid}});
  await this.update({encourageTotal});
};

threadSchema.methods.updateThreadMessage = async function() {
  const PostModel = mongoose.model('posts');
  const timeToNow = new Date();
  const time = new Date(`${timeToNow.getFullYear()}-${timeToNow.getMonth()+1}-${timeToNow.getDate()}`);
  const updateObj = {};
  const lm = await PostModel.findOne({tid: this.tid, disabled: false}).sort({toc: -1});
  const oc = await PostModel.findOne({tid: this.tid}).sort({toc: 1});
  updateObj.tlm = lm.toc;
  updateObj.toc = oc.toc;
  updateObj.lm = lm.pid;
  updateObj.oc = oc.pid;
  updateObj.count = await PostModel.count({tid: this.tid});
  updateObj.countToday = await PostModel.count({tid: this.tid, toc: {$gt: time}});
  updateObj.countRemain = await PostModel.count({tid: this.tid, disabled: {$ne: true}});
  updateObj.uid = oc.uid;

  const userCount = await PostModel.aggregate([
    {
      $match: {
        tid: this.tid
      }
    },
    {
      $group: {
        _id: "$uid"
      }
    }
  ]);
  updateObj.replyUserCount = userCount.length - 1;


  await this.update(updateObj);
  await PostModel.updateMany({tid: this.tid}, {$set: {mainForumsId: this.mainForumsId}});
  const forums = await this.extendForums(['mainForums']);
  await Promise.all(forums.map(async forum => {
    await forum.updateForumMessage();
  }));
};

threadSchema.methods.newPost = async function(post, user, ip) {
  const SettingModel = mongoose.model('settings');
  const UsersPersonalModel = require('./UsersPersonalModel');
  const PostModel = mongoose.model('posts');
  const redis = require('../redis');
  const MessageModel = mongoose.model('messages');
  const UserModel = mongoose.model('users');
  const ReplyModel = mongoose.model('replies');
  const dbFn = require('../nkcModules/dbFunction');
  const apiFn = require('../nkcModules/apiFunction');
  const pid = await SettingModel.operateSystemID('posts', 1);
  const {c, t, l, abstract} = post;
  const quote = await dbFn.getQuote(c);
  if(this.uid !== user.uid) {
    const replyWriteOfThread = new ReplyModel({
      fromPid: pid,
      toPid: this.oc,
      toUid: this.uid
    });
    await replyWriteOfThread.save();
  }
  let rpid = '';
  if(quote && quote[2]) {
    rpid = quote[2];
  }
  const _post = await new PostModel({
    pid,
    c,
    t,
    abstract,
    ipoc: ip,
    iplm: ip,
    l,
    mainForumsId: this.mainForumsId,
    minorForumsId: this.minorForumsId,
    tid: this.tid,
    uid: user.uid,
    uidlm: user.uid,
    rpid
  });
  await _post.save();
  await this.update({
    lm: pid,
    tlm: Date.now()
  });
  if(quote && quote[2] !== this.oc) {
    const username = quote[1];
    const quPid = quote[2];
    const quUser = await UserModel.findOne({username});
    const quPost = await PostModel.findOne({pid: quPid});
    if(quUser && quPost) {
      const reply = new ReplyModel({
        fromPid: pid,
        toPid: quPid,
        toUid: quUser.uid
      });
      await reply.save();
      const messageId = await SettingModel.operateSystemID('messages', 1);
      const message = MessageModel({
        _id: messageId,
        r: quUser.uid,
        ty: 'STU',
        c: {
          type: 'replyPost',
          targetPid: pid+'',
          pid: quPid+''
        }
      });

      await message.save();

      await redis.pubMessage(message);
    }
  }
  await this.update({lm: pid});
  if(!user.generalSettings.lotterySettings.close) {
    const redEnvelopeSettings = await SettingModel.findOnly({_id: 'redEnvelope'});
    if(!redEnvelopeSettings.c.random.close) {
      const postCountToday = await PostModel.count({uid: user.uid, toc: {$gte: apiFn.today()}});
      if(postCountToday === 1) {
        await user.generalSettings.update({'lotterySettings.status': true});
      }
    }
  }
  return _post
};
 // 算post所在楼层
threadSchema.methods.getStep = async function(obj) {
  const PostModel = mongoose.model('posts');
  const {perpage} = require('../settings').paging;
  const pid = obj.pid;
  const q = {
    tid: this.tid
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
  forum: true,
  category: false,
  firstPost: true,
  firstPostUser: true,
  userInfo: true,
  lastPost: true,
  lastPostUser: true,
  firstPostResource: false,
  htmlToText: false,
  count: 200
};
threadSchema.statics.extendThreads = async (threads, options) => {
  const o = Object.assign({}, defaultOptions);
  Object.assign(o, options);
  let PostModel, UserModel, ForumModel, ThreadTypeModel;
  if(o.firstPost || o.lastPost) {
    PostModel = mongoose.model('posts');
    if(o.lastPostUser || o.firstPostUser) {
      UserModel = mongoose.model('users');
    }
  }
  if(o.forum) {
    ForumModel = mongoose.model('forums');
  }
  if(o.category) {
    ThreadTypeModel = mongoose.model('threadTypes');
  }

  let forumsId = [], postsId = new Set(), postsObj = {}, usersId = new Set(), usersObj = {}, cid = [];
  const parentForumsId = new Set(), forumsObj = {}, categoryObj = {};

  threads = threads.filter(thread => !!thread);

  threads.map(thread => {
    if(!thread) return;
    if(o.firstPost) {
      postsId.add(thread.oc);
    }
    if(o.forum) {
      forumsId = forumsId.concat(thread.mainForumsId);
    }
    if(o.lastPost && thread.lm) postsId.add(thread.lm);
    if(thread.categoriesId && thread.categoriesId.length !== 0) {
      cid = cid.concat(thread.categoriesId);
    }
  });

  if(o.firstPost || o.lastPost) {
    const posts = await PostModel.find({pid: {$in: [...postsId]}}, {
      pid: 1,
      t: 1,
      c: 1,
      abstract: 1,
      uid: 1,
      toc: 1,
      tlm: 1,
      l: 1,
      tid: 1,
      mainForumsId: 1,
      voteUp: 1,
      voteDown: 1
    });
    posts.map(post => {
      if(o.htmlToText) {
        post.c = obtainPureText(post.c, true, o.count);
      }
      postsObj[post.pid] = post;
      if(o.firstPostUser || o.lastPostUser) {
        usersId.add(post.uid);
      }
    });

    if(o.firstPostUser || o.lastPostUser) {
      const users = await UserModel.find({uid: {$in: [...usersId]}}, {
        uid: 1,
        toc: 1,
        tlv: 1,
        username: 1,
        xsf: 1,
        kcb: 1,
        description: 1,
        certs: 1,
        threadCount: 1,
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

  if(o.forum) {
    // let forums = await ForumModel.find({fid: {$in: [...new Set(forumsId)]}});
    let forums = await ForumModel.find({fid: {$in: [...new Set(forumsId)]}}, {
      fid: 1,
      displayName: 1,
      description: 1,
      forumType: 1,
      color: 1,
      parentsId: 1,
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

  return await Promise.all(threads.map(async thread => {
    thread.categories = [];
    if(o.firstPost) {
      const firstPost = postsObj[thread.oc];
      if(o.firstPostUser) {
        firstPost.user = usersObj[firstPost.uid];
      }
      thread.firstPost = firstPost;
    }
    if(o.lastPost) {
      if(!thread.lm || thread.lm === thread.oc) {
        thread.lastPost = thread.firstPost;
      } else {
        const lastPost = postsObj[thread.lm];
        if(o.lastPostUser) {
          lastPost.user = usersObj[lastPost.uid];
        }
        thread.lastPost = lastPost;
      }

    }
    if(o.forum) {
      const forums = [];
      for(const fid of thread.mainForumsId) {
        forums.push(forumsObj[fid]);
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
    return thread.toObject?thread.toObject():thread;
  }));
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


/* 
  发表时的权限判断，根据用户等级、证书和认证等级，获取发表文章的条数限制和时间限制
  @param userInfo: 用户对象或uid
  @author pengxiguaa 2019/3/7
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
  if(!user.authLevel) await user.extendAuthLevel();
  const postSettings = await SettingModel.findOnly({_id: 'post'});
  const {authLevelMin, exam} = postSettings.c.postToForum;
  const {volumeA, volumeB, notPass} = exam;
  const {status, countLimit, unlimited} = notPass;
  const today = apiFunction.today();
  const todayThreadCount = await ThreadModel.count({toc: {$gt: today}, uid: user.uid});
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
    abstract: String 摘要
  @author pengxiguaa 2019/3/7  
*/
threadSchema.statics.publishArticle = async (options) => {
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const SettingModel = mongoose.model('settings');
  const UserModel = mongoose.model('users');
  const {uid, fids, cids, ip, title, content, abstract, type} = options;
  if(!uid) throwErr(404, '用户ID不能为空');
  const user = await UserModel.findById(uid);
  await ThreadModel.ensurePublishPermission(options);
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
    abstract,
    ip,
    uid,
    tid
  });
  await thread.update({$set:{oc: post.pid, count: 1, hits: 1}});
  return await ThreadModel.findThreadById(thread.tid);
};

module.exports = mongoose.model('threads', threadSchema);