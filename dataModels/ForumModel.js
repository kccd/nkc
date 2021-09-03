const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const client = settings.redisClient;
const getRedisKeys = require('../nkcModules/getRedisKeys');

const forumSchema = new Schema({
	abbr: {
    type: String,
    default: '',
    max: [4, '简称必须小于等于4字']
  },
  class: {
    type: String,
    default: 'null'
  },
  color: {
    type: String,
    default: '#808080'
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
    index: 1,
    default: 0
  },
  kindName: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: '',
    maxlength: [300, '描述应少于300字']
  },
  // 专业选择器中，有关发表文章的说明
  noteOfPost: {
	  type: String,
    default: '',
    maxlength: [300, '发表说明应少于300字']
  },
  displayName: {
    type: String,
    required: true,
    minlength: [1, '板块名称必须大于等于1字'],
    maxlength: [20, '板块名称必须小于等于10字']
  },
	brief: {
		type: String,
		default: '',
		maxlength: [20, '板块简介应少于15字']
	},
	// 入门
	basicThreadsId: {
		type: [String],
		default: []
	},
	// 值得阅读
	valuableThreadsId: {
		type: [String],
		default: []
	},
	// 板块说明
	declare: {
		type: String,
		default: ''
  },
  // 专业最新页板块公告
  latestBlockNotice: {
    type: String,
    default: ''
  },
	noticeThreadsId: {
		type: [String],
		default: []
	},
	iconFileName: {
    type: String,
    default: ''
  },
  // 专业logo
  logo: {
    type: String,
    default: '',
  },
  // 专业背景
  banner: {
    type: String,
    default: ''
  },
  moderators: {
    type: [String],
    default: []
  },
  order: {
    type: Number,
    default: 0
  },
  // 可访问的
  accessible: {
    type: Boolean,
    default: true,
    index: 1
  },
	// 在父板显示
	displayOnParent: {
		type: Boolean,
		default: true,
		index: 1
	},

  //在搜索页显示
  displayOnSearch: {
    type: Boolean,
    default: true,
    index: 1
  },

  // 文章列表的显示风格
  threadListStyle: {
	  type: { // 显示样式 abstract: 摘要模式, brief: 简略模式, minimalist: 极简模式
	    type: String,
      default: 'abstract',
    },
    cover: { // 封面图位置 left: 左侧, right: 右侧, null: 不显示封面图
      type: String,
      default: 'left'
    }
  },

  // 文章列表是否显示文章摘要 旧
  displayPostAbstract: {
    type: Boolean,
    default: true,
    index: 1
  },
  // 文章列表封面图位置 left: 左侧，right: 右侧，null: 不显示 旧
  postCoverPosition: {
    type: String,
    default: 'left',
    index: 1
  },

	// 有权用户在导航可见
	visibility: {
		type: Boolean,
		default: true,
		index: 1
	},

	// 无权用户在导航可见 is visible for noContentClass
	isVisibleForNCC: {
		type: Boolean,
		default: false,
		index: 1
	},
	// 关注的人
	followersId: {
		type: [String],
		default: [],
		index: 1
	},

  // 关注的人数
  followerCount: {
    type: Number,
    default: 0
  },

	// 用户角色限制
	rolesId: {
		type: [String],
		default: [],
		index: 1
	},

	// 用户等级限制
	gradesId: {
		type: [Number],
		default: [],
		index: 1
	},
	// 用户角色和等级之间的关系：与、或
	relation: {
		type: String,
		default: 'or',// and
		index: 1
	},

  // 发表、阅读权限相关
  permission: {
	  // 发表文章
    write: {
      rolesId: {
        type: [String],
        default: ['dev'],
      },
      gradesId: {
        type: [Number],
        default: []
      },
      relation: {
        type: String,
        default: 'or'
      }
    },
    // 发表回复和评论
    writePost: {
      rolesId: {
        type: [String],
        default: ['dev'],
      },
      gradesId: {
        type: [Number],
        default: []
      },
      relation: {
        type: String,
        default: 'or'
      }
    },
    read: {
      rolesId: {
        type: [String],
        default: ['dev']
      },
      gradesId: {
        type: [Number],
        default: []
      },
      relation: {
        type: String,
        default: 'or'
      }
    }
  },

  orderBy: {
    type: String,
    default: 'tlm', // tlm: 复序, toc: 贴序
  },

  // 是否允许分享专业下的文章，
  shareLimitStatus: {
    type: String,
    default: 'inherit', // inherit: 继承后台, off: 关闭，on: 开启
  },
  // 分享链接的时间限制
  shareLimitTime: {
	  type: Number,
    default: 1 // 小时
  },
  // 分享链接的访问次数限制
  shareLimitCount: {
    type: Number,
    default: 1 // 次数
  },
  fid: {
    type: String,
    unique: true,
    required: true
	},
	// 相关专业
	relatedForumsId: {
		type: [String],
    default: [],
    index: 1
	},
	// 专业类型 旧
	//--topic 话题
	//--discipline 学科
	forumType: {
		type: String,
		default: 'discipline'
  },
  // 专业分类
  categoryId: {
    type: Number,
    required: true,
    index: 1,
  },
	// 上级板块
	parentsId: {
		type: [String],
    default: [],
    index: 1
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
  // 关注类型
  // force: 强制关注（关注后不可取消）
  // free: 自由关注（可取消）
  // unSub: 不可关注（已关注的可取消）
  subType: {
    type: String,
    default: "free",
    index: 1
  },
  // 是否允许发表匿名内容
  allowedAnonymousPost: {
    type: Boolean,
    default: false
  },
  // 文库ID
  lid: {
    type: Number,
    default: null,
    index: 1
  },
  // 是否开启流控
  openReduceVisits: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 创始人uid列表
  founders: {
    type: Array,
    default: [],
  },
  // 审核设置
  reviewSettings: {
    // 内容送审
    content: {
      // 范围
      range: {
        type: String,
        match: /^(all|only_thread|only_reply)$/,
        default: "all"
      },
      // 规则
      rule: {
        thread: {
          anyone: { type: Boolean, default: false },
          roles: { type: [String], default: [] },
          grades: { type: [Number], default: [] },
          relationship: {
            type: String,
            match: /^(and|or)$/,
            default: "or"
          }
        },
        reply: {
          anyone: { type: Boolean, default: false },
          roles: { type: [String], default: [] },
          grades: { type: [Number], default: [] },
          relationship: {
            type: String,
            match: /^(and|or)$/,
            default: "or"
          }
        }
      }
    },
    // 敏感词送审
    keyword: {
      // 范围
      range: {
        type: String,
        match: /^(all|only_thread|only_reply)$/,
        default: "all"
      },
      // 规则
      rule: {
        thread: {
          useGroups: {
            type: [String],
            default: [],
          }
        },
        reply: {
          useGroups: {
            type: [String],
            default: [],
          }
        }
      }
    },
  },
  // 高赞列表筛选条件
  voteUpPost: {
    status: {
      type: String,
      default: 'inherit', // show, hide, inherit
    },
    postCount: {
      type: Number,
      default: 1
    },
    voteUpCount: {
      type: Number,
      default: 1
    },
    selectedPostCount: {
      type: Number,
      default: 1
    },
  }
}, {toObject: {
		getters: true,
		virtuals: true
}});

forumSchema.virtual('moderatorUsers')
	.get(function() {
		return this._moderatorUsers;
	})
	.set(function(moderatorUsers) {
		this._moderatorUsers = moderatorUsers;
	});

forumSchema.virtual('childrenForums')
	.get(function() {
		return this._childrenForums;
	})
	.set(function(childrenForums) {
		this._childrenForums = childrenForums;
  });
forumSchema.virtual('relatedForums')
	.get(function() {
		return this._relatedForums;
	})
	.set(function(relatedForums) {
		this._relatedForums = relatedForums;
	});

forumSchema.virtual('parentForums')
	.get(function() {
		return this._parentForums;
	})
	.set(function(parentForums) {
		this._parentForums = parentForums;
	});

forumSchema.virtual('basicThreads')
	.get(function() {
		return this._basicThreads;
	})
	.set(function(basicThreads) {
		this._basicThreads = basicThreads;
	});

forumSchema.virtual('valuableThreads')
	.get(function() {
		return this._valuableThreads;
	})
	.set(function(valuableThreads) {
		this._valuableThreads = valuableThreads;
	});

forumSchema.virtual('noticeThreads')
	.get(function() {
		return this._noticeThreads;
	})
	.set(function(noticeThreads) {
		this._noticeThreads = noticeThreads;
	});

forumSchema.virtual('followers')
	.get(function() {
		return this._followers;
	})
	.set(function(followers) {
		this._followers = followers;
	});

forumSchema.virtual('threadTypes')
  .get(function() {
    return this._threadTypes;
  })
  .set(function(threadTypes) {
    this._threadTypes = threadTypes;
  });



/*  缓存主页需要的属性   */

forumSchema.virtual('childForums')
  .get(function() {
    return this._childForums;
  })
  .set(function(childForums) {
    this._childForums = childForums;
  });

forumSchema.virtual('allChildForums')
  .get(function() {
    return this._allChildForums;
  })
  .set(function(allChildForums) {
    this._allChildForums = allChildForums;
  });

forumSchema.virtual('allChildForumsId')
  .get(function() {
    return this._allChildForumsId;
  })
  .set(function(allChildForumsId) {
    this._allChildForumsId = allChildForumsId;
  });

forumSchema.virtual('childForumsId')
  .get(function() {
    return this._childForumsId;
  })
  .set(function(childForumsId) {
    this._childForumsId = childForumsId;
  });


/*-----------------------*/


// 加载版主
forumSchema.methods.extendModerators = async function() {
	const UserModel = require('./UserModel');
	const {moderators} = this;
	const moderatorUsers = [];
	for(let uid of moderators){
		const user = await UserModel.findOne({uid});
		if(user) {
			moderatorUsers.push(user);
		}
	}
	return this.moderatorUsers = moderatorUsers;
};

// 入门教程
forumSchema.methods.extendBasicThreads = async function() {
	const ThreadModel = mongoose.model('threads');
	const {basicThreadsId} = this;
  const threads = [];
  const threads_ = await ThreadModel.find({oc: {$in: basicThreadsId}});
  threads_.map(thread => {
    var index = basicThreadsId.indexOf(thread.oc);
    threads[index] = thread;
  });
	return this.basicThreads = await ThreadModel.extendThreads(threads, {
    htmlToText: true,
    count: 200,
  });
};
// 值得阅读
forumSchema.methods.extendValuableThreads = async function() {
	const ThreadModel = mongoose.model('threads');
	const {valuableThreadsId} = this;
	const threads = [];
	const threads_ = await ThreadModel.find({oc: {$in: valuableThreadsId}});
	threads_.map(thread => {
    var index = valuableThreadsId.indexOf(thread.oc);
    threads[index] = thread;
  });
	return this.valuableThreads = await ThreadModel.extendThreads(threads, {
    htmlToText: true,
    count: 200,
  });
};

// 公告
forumSchema.methods.extendNoticeThreads = async function() {
	const ThreadModel = mongoose.model('threads');
	const {noticeThreadsId} = this;
  const threads = [];
  const threads_ = await ThreadModel.find({oc: {$in: noticeThreadsId}});
  threads_.map(thread => {
    var index = noticeThreadsId.indexOf(thread.oc);
    threads[index] = thread;
  });
	return this.noticeThreads = await ThreadModel.extendThreads(threads, {
    htmlToText: true,
    count: 200,
  });
};


/*
* 更新全部专业的文章数、回复数等
* 太耗时间，最好放到线程中执行
* @author pengxiguaa 2020-8-19
* */
forumSchema.statics.updateForumsMessage = async () => {
  const ForumModel = mongoose.model('forums');
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const apiFunction = require('../nkcModules/apiFunction');
  const _forums = await ForumModel.find({});
  const parents = {};
  const forumsObj = {};
  const forums = [];
  for(const _forum of _forums) {
    const forum = _forum.toObject();
    forumsObj[forum.fid] = forum;
    forums.push(forum);
    if(parents[forum.fid]) {
      forum.childForums = parents[forum.fid];
    } else {
      forum.childForums = [];
      parents[forum.fid] = forum.childForums;
    }
    const {parentsId} = forum;
    if(!parentsId || !parentsId.length) continue;
    for(const fid of parentsId) {
      if(!parents[fid]) parents[fid] = [];
      parents[fid].push(forum);
    }
  }
  const children = forums.filter(forum => !forum.childForums.length);
  // 先更新最底层的专业，作为上层专业的信息来源，无需再查数据库
  for(const c of children) {
    const {fid} = c;
    const countPosts = await PostModel.countDocuments({
      type: 'post',
      mainForumsId: fid,
      parentPostId: ''
    });
    const countThreads = await PostModel.countDocuments({
      type: 'thread',
      mainForumsId: fid,
    });
    const digest = await ThreadModel.countDocuments({
      mainForumsId: fid, digest: true,
    });
    const tCount = {
      digest,
      normal: countThreads - digest
    };
    const today = apiFunction.today();
    const countPostsToday = await PostModel.countDocuments({
      mainForumsId: fid,
      toc: {$gte: today},
      parentPostId: ''
    });
    await ForumModel.updateOne({fid}, {
      $set: {
        tCount,
        countPosts,
        countThreads,
        countPostsToday
      }
    });
    c.tCount = tCount;
    c.countPosts = countPosts;
    c.countThreads = countThreads;
    c.countPostsToday = countPostsToday;
  }
  const _updatedForums = [];
  // 更新上层专业
  const func = async (parentsId = []) => {
    for(const fid of parentsId) {
      const forum = forumsObj[fid];
      if(!forum || _updatedForums.includes(forum)) continue;
      const _children = forum.childForums;
      let tCount = {
        digest: 0,
        normal: 0
      }, countPosts = 0, countThreads = 0, countPostsToday = 0;
      for(const f of _children) {
        tCount.digest += f.tCount.digest;
        tCount.normal += f.tCount.normal;
        countPosts += f.countPosts;
        countThreads += f.countThreads;
        countPostsToday += f.countPostsToday;
      }
      await ForumModel.updateOne({fid}, {
        $set: {
          tCount,
          countPosts,
          countThreads,
          countPostsToday
        }
      });
      _updatedForums.push(forum);
      await func(forum.parentsId);
    }
  };
  for(const c of children) {
    await func(c.parentsId);
  }
};

/*
* 更新多个专业的统计数据
* @param {[String]} threads 更改的文章
* @param {[Boolean]} isAdd 是否为加操作
* @author ll 2020-1-3
* */
forumSchema.statics.updateCount = async function (threads, isAdd) {
	const ForumModel = mongoose.model('forums');
	const today = require("../nkcModules/apiFunction").today();
  const updateParentForums = async (forum, tif) => {
    if(!forum) return;
    const countThreads = isAdd ? (forum.countThreads + tif.length) : (forum.countThreads - tif.length);
    let countPosts = forum.countPosts;
    let countPostsToday = forum.countPostsToday;
    tif.forEach(ele => {
      if(isAdd) {
        countPosts += ele.count;
        countPostsToday += ele.countToday + (ele.toc > today? 1: 0)
      } else {
        countPosts -= ele.count;
        countPostsToday -= ele.countToday + (ele.toc > today? 1: 0)
      }
    });
    countPostsToday = countPostsToday>0?countPostsToday:0;
    await forum.updateOne({countThreads, countPosts, countPostsToday});
    if(forum.parentsId.length === 0) return;
    await updateParentForums(await ForumModel.findOne({fid: forum.parentsId}), tif);
  };

  const forums = {};
  threads.forEach((ele,index) => {
    ele.mainForumsId.forEach(fid => {
      forums[fid] ? forums[fid].push(ele) : forums[fid] = [ele];
    })
  });
  for (let fid in forums) {
    await updateParentForums(await ForumModel.findOne({fid}), forums[fid]);
  }
};


forumSchema.methods.newPost = async function(post, user, ip, cids, toMid, fids) {
  const SettingModel = mongoose.model('settings');
  const ThreadModel = mongoose.model('threads');
  const ForumModel = mongoose.model('forums');
  const PersonalForumModel = mongoose.model('usersPersonal');
  const tid = await SettingModel.operateSystemID('threads', 1);
  const t = {
    tid,
    categoriesId: cids,
    mainForumsId: fids,
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
  const _post = await thread.newPost(post, user, ip);
  await thread.updateOne({$set:{lm: _post.pid, oc: _post.pid, count: 1, hits: 1}});
  // await ForumModel.updateMany({fid: {$in: fids}}, {$inc: {
  //   'tCount.normal': 1,
  //   'countPosts': 1,
  //   'countThreads': 1
  // }});
  return _post;
};

/*
  加载当前专业的下级专业
  @param q 查询专业的其他条件
  @return 下级专业对象数组
  @author pengxiguaa 2019/1/24
*/
forumSchema.methods.extendChildrenForums = async function(q) {
	const ForumModel = mongoose.model('forums');
	q = q || {};
	q.parentsId = this.fid;
	return this.childrenForums = await ForumModel.find(q).sort({order: 1});
};

/*
  加载当前专业的上级专业
  @return 上级专业对象数组
  @author pengxigua 2019/1/24
*/
forumSchema.methods.extendParentForums = async function() {
	let parentForums = [];
	if(this.parentsId.length !== 0) {
		const ForumModel = mongoose.model('forums');
		parentForums = await ForumModel.find({fid: {$in: this.parentsId}});
	}
	return this.parentForums = parentForums;
};

forumSchema.methods.extendFollowers = async function() {
	const UserModel = mongoose.model('users');
	const users = [];
	for (let uid of this.followersId) {
		const user = await UserModel.findOne({uid});
		if(user) {
			users.push(user);
		}
	}
	return this.followers = users;
};

// 若当前专业为第五级，则返回 [第一级, 第二级, 第三级, 第四级];
forumSchema.methods.getBreadcrumbForums = async function() {
	const ForumModel = mongoose.model('forums');
	const fid = await client.smembersAsync(`forum:${this.fid}:parentForumsId`);
  if(fid.length === 0 || !this.parentsId.length) return fid;
  const forums_ = await ForumModel.find({fid: {$in: fid}});
  const forums = [];
  const forumsObj = {};
  for(const f of forums_) {
    forumsObj[f.fid] = f;
  }
  const getParent = (parentId) => {
    const f = forumsObj[parentId];
    if(f) {
      forums.unshift(f);
      if(f.parentsId && f.parentsId.length) {
        getParent(f.parentsId[0]);
      }
    }
  };

  getParent(this.parentsId[0]);
  return forums;
};



// ----------------------------- 加载能管理的板块fid ---------------------------------
forumSchema.statics.canManagerFid = async function(roles, grade, user, baseFid) {
  const ForumModel = mongoose.model('forums');
  let uid;
  if(typeof user === 'object') {
    uid = user.uid;
  } else {
    uid = user;
  }
  const fid = await ForumModel.getAccessibleForumsId(roles, grade, user, baseFid);

  const mFid = await client.smembersAsync(`moderator:${uid}:forumsId`);

  return mFid.filter(f => fid.includes(f));
};
// ------------------------------------------------------------------------------


// ----------------------------- 加载能管理的板块 ---------------------------------
forumSchema.statics.canManagerForums = async function(roles, grade, user, baseFid) {
  const ForumModel = mongoose.model('forums');
  const fid = await ForumModel.canManagerFid(roles, grade, user, baseFid);
  return await ForumModel.find({fid: {$in: fid}});
};
// ------------------------------------------------------------------------------



// ----------------------------- 加载能看到入口的专业 ------------------------------
// 若forum.visibility = true, 则用户可在导航看到该专业的入口
// forumSchema.statics.visibleForums = async (options) => {
forumSchema.statics.visibleForums = async (roles, grade, user, forumType) => {
  const ForumModel = mongoose.model('forums');
  const fid = await ForumModel.visibleFid(roles, grade, user);
  let queryMap = {
    fid: {$in: fid}
  }
  if(forumType){
    queryMap.forumType = forumType;
  }
  return await ForumModel.find(queryMap).sort({order: 1});
};
// -----------------------------------------------------------------------------



// ----------------------------- 加载能看到入口的专业fid ----------------------------
// 若forum.visibility = true, 则用户可在导航看到该专业的入口
// forumSchema.statics.visibleFid = async (options) => {
forumSchema.statics.visibleFid = async (roles, grade, user, baseFid) => {
  const ForumModel = mongoose.model('forums');
  // 能访问的专业ID，理应能看到入口，但专业设置了在导航不可见除外。
  const accessibleFid = await ForumModel.getAccessibleForumsId(roles, grade, user, baseFid);
  // 不能在导航看到入口的专业ID，就算你权限高得离谱也无济于事。
  const canNotDisplayOnNavForumsId = await client.smembersAsync('canNotDisplayOnNavForumsId');
  // 无权用户也能看到入口的专业ID
  const canDisplayOnNavForumsIdNCC = await client.smembersAsync('canDisplayOnNavForumsIdNCC');
  let results = accessibleFid.concat(canDisplayOnNavForumsIdNCC);

  return results.filter(f => !canNotDisplayOnNavForumsId.includes(f));

	/*const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.visibleForums(options);
	return forums.map(forum => forum.fid);*/
};
// -----------------------------------------------------------------------------



// ----------------------------- 访问专业权限判断 --------------------------------
// 判断该专业以及上层专业是否可以访问。
// 1. 专业是否处于开放状态（forum.accessible = true）
// 2. 是否是该专业的专家。
// 3. 用户等级是否满足条件。
// 4. 角色是否满足条件。
/*forumSchema.methods.ensurePermissionNew = async function(options) {
	this.ensureForumPermission(options);
	const forums = await this.getBreadcrumbForums();
	forums.map(forum => {
		forum.ensureForumPermission(options);
	})
};*/
forumSchema.methods.ensureForumPermission = function(options) {
	if(!this.accessible) {
		const err = new Error('专业已暂停访问');
		err.status = 403;
		throw err;
	}
	const {gradeId, rolesId, uid} = options;
	if(uid && this.moderators.includes(uid)) return;
	let hasRole = false;
	for(const roleId of this.rolesId) {
		if(rolesId.includes(roleId)) {
			hasRole = true;
			break;
		}
	}
	let hasGrade = this.gradesId.includes(gradeId);
	if(this.relation === 'and') {
		if(!hasGrade || !hasRole) {
			const err = new Error('权限不足');
			err.status = 403;
			throw err;
		}
	} else if(this.relation === 'or') {
		if(!hasGrade && !hasRole) {
			const err = new Error('权限不足');
			err.status = 403;
			throw err;
		}
	} else {
		const err = new Error(`专业数据错误(fid: ${this.fid}, relation: ${this.relation})`);
		err.status = 500;
		throw err;
	}
};
// ------------------------------------------------------------------------------

// ----------------------------- 验证是否为专家 ----------------------------
// 若用户是某个专业的专家，则该用户是该专业以及所有子专业的专家
forumSchema.methods.isModerator = async function(uid) {
  if(typeof uid === 'object') {
    uid = uid.uid;
  }
  if(!uid) return false;
  const key = `moderator:${uid}:forumsId`;
  const fid = await client.smembersAsync(key);
  return fid.includes(this.fid);

  /*if(!uid) return false;
  let isModerator = false;
  const breadcrumbForums = await this.getBreadcrumbForums();
  breadcrumbForums.map(forum => {
    if(forum.moderators.includes(uid)) {
      isModerator = true;
		}
	});
	return isModerator;*/
};


/*
* 判断用户是否为指定id专业的专家
* @param {String} uid 用户ID
* @param {[String]} [fid, fid, ...] 专业id组成的数据
* @return {Boolean} 是否为专家
* @author pengxiguaa 2020-12-21
* */
forumSchema.statics.isModerator = async (uid, forumsId = []) => {
  const ForumModel = mongoose.model('forums');
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOne({uid});
  if(!user) return false;
  const isSuperModerator = await user.isSuperModerator();
  if(isSuperModerator) return true;
  const forums = await ForumModel.find({fid: {$in: forumsId}}, {moderators: 1});
  for(const forum of forums) {
    if(forum.moderators.includes(uid)) return true;
  }
  return false;
};
// -----------------------------------------------------------------------

// 拿到某个专业的所有子专业，不验证权限
forumSchema.statics.getAllChildrenForums = async function(fid) {
	const ForumModel = mongoose.model('forums');
	let accessibleForum = [];
	const findForums = async (parentId) => {
		const forums = await ForumModel.find({parentsId: parentId}).sort({order: 1});
		accessibleForum = accessibleForum.concat(forums);
		await Promise.all(forums.map(async forum => {
			await findForums(forum.fid);
		}));
	};
	fid = fid || '';
	await findForums(fid);
	return accessibleForum;
};

// 拿到某个专业的所有子专业id，不验证权限
forumSchema.statics.getAllChildrenFid = async function(fid) {
	const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.getAllChildrenForums(fid);
	return forums.map(f => f.fid);
};





/*
  获取专业下的所有专业的id
  @return 专业id数组
  @author pengxiguaa 2019/1/26
*/
forumSchema.methods.getAllChildForumsId = async function() {
  return await client.smembersAsync(`forum:${this.fid}:allChildForumsId`);
};

forumSchema.statics.getAllChildForumsIdByFid = async function(fid) {
  return await client.smembersAsync(`forum:${fid}:allChildForumsId`);
};



/*
  获取专业下的全部专业
  @return 专业对象数组
  @author pengxiguaa 2019/1/26
*/
forumSchema.methods.getAllChildForums = async function() {
  const ForumModel = mongoose.model('forums');
  const allChildForumsId = await this.getAllChildForumsId();
  const forums = await ForumModel.find({fid: {$in: allChildForumsId}});
  return this.allChildForums = forums;
}
/*
  验证多个专业的权限，只要有一个专业无权访问都会抛出403错误
  @param arr: 专业对象数组[forum1, forums, ...]或专业id数组[fid1, fid2, ...]
  @param userInfo: 用户对象或uid
  @author pengixguaa 2019/3/7
*/
forumSchema.statics.ensureForumsPermission = async (arr, userInfo) => {
  const ForumModel = mongoose.model('forums');
  const UserModel = mongoose.model('users');
  if(!arr) throwErr(500, 'arr is a required parameter in forum.statics method');
  let forums = arr;
  if(forums.length === 0) return;
  if(forums[0].constructor === String) {
    forums = await ForumModel.find({fid: {$in: forums}});
  }
  if(!userInfo) throwErr(500, `userInfo is a required parameter in forum.statics method`);
  let user = userInfo;
  if(userInfo.constructor === String) {
    user = await UserModel.findById(uid);
  }
  if(!user.roles) {
    await user.extendRoles();
  }
  if(!user.grade) {
    await user.extendGrade();
  }
  const fid = await ForumModel.getAccessibleForumsId(user.roles, user.grade, user);
  await Promise.all(forums.map(async forum => {
    if(fid.includes(forum.fid)) return;
    throwErr(403, `您没有权限访问专业【${forum.displayName}】，且无法在该专业下发表任何内容。`)
  }));
};

// 判断用户是否有权访问该版块
forumSchema.methods.ensurePermission = async function(roles, grade, user) {
  const throwError = require("../nkcModules/throwError");
  const ForumModel = mongoose.model('forums');
  const fid = await ForumModel.getAccessibleForumsId(roles, grade, user);
  if(!fid.includes(this.fid)) {
    if(this.permission.read.rolesId.includes('default')) {
      throwError(403, `您没有权限访问专业【${this.displayName}】，且无法在该专业下发表任何内容。`, "noPermissionToReadForum");
    } else {
      throwError(403, `根据相关法律法规和政策，页面不予显示`, "simpleErrorPage");
    }
  }
};

/* 获取能在上层显示文章的专业id
  @param roles 角色对象数组
  @param grade 用户等级对象
  @param user user对象，主要用于判断用户是否为版主
  @param baseFid 过滤返回的结果，只返回该专业下的专业的fid
  @return fid数组
  @author pengxiguaa 2019/1/24
*/
forumSchema.statics.getThreadForumsId = async (roles, grade, user, baseFid) => {
  const ForumModel = mongoose.model('forums');
  // 有权访问的专业ID
  let fid = [];
  fid = await ForumModel.getAccessibleForumsId(roles, grade, user, baseFid);
  if(baseFid) {
    const forum = await ForumModel.findOnly({fid: baseFid});
    for(const relatedFid of forum.relatedForumsId) {
      const rFid = await ForumModel.getAccessibleForumsId(roles, grade, user, relatedFid);
      fid = fid.concat(rFid);
    }
  }
  // 在上级专业不显示文章的专业ID
  const canNotFid = await client.smembersAsync('canNotDisplayOnParentForumsId');
  // 找出所有无法在父级显示的版块ID
  return [...new Set(fid)].filter(f => !canNotFid.includes(f));
};

// 获取有权限访问的专业
forumSchema.statics.getAccessibleForums = async (roles, grade, user, baseFid) => {
  const ForumModel = mongoose.model('forums');
  const fid = await ForumModel.getAccessibleForumsId(roles, grade, user, baseFid);
  return await ForumModel.find({fid: {$in: fid}}).sort({order: 1});
};

// 获取全部商城类别专业
forumSchema.statics.getAllShopForums = async (roles, grade, user, baseFid) => {
  const ForumModel = mongoose.model('forums');
  const fid = await ForumModel.getAccessibleForumsId(roles, grade, user, baseFid);
  return await ForumModel.find({fid: {$in:fid}, "kindName":"shop"}).sort({order: 1});
};

// 获取有权限访问的专业ID
forumSchema.statics.getAccessibleForumsId = async (roles, grade, user, baseFid) => {

  let rolesId, gradeId, uid;

  if(typeof roles[0] === 'object') {

    rolesId = roles.map(r => r._id);

  } else {
    rolesId = roles;
  }

  let fid = [];

  if(!user) {
    // 游客
    for(const roleId of rolesId) {
      const f = await client.smembersAsync(`role:${roleId}:forumsId`);
      fid = fid.concat(f);
    }

  } else {
    // 用户

    if(typeof grade === 'object') {
      gradeId = grade._id;
    } else {
      gradeId = grade;
    }

    if(typeof user === 'string') {
      uid = user;
    } else {
      uid = user.uid;
    }

    const fidForUid = await client.smembersAsync(`moderator:${uid}:forumsId`);

    fid = fid.concat(fidForUid);


    for(const roleId of rolesId) {
      const fidForRoleAndGrade = await client.smembersAsync(`role-grade:${roleId}-${gradeId}:forumsId`);
      fid = fid.concat(fidForRoleAndGrade);
    }

  }

	if(baseFid) {
		const childFid = await client.smembersAsync(`forum:${baseFid}:allChildForumsId`);
		fid = fid.filter(f => childFid.includes(f));
	}

  return [...new Set(fid)];
};
/*
  判断用户是否具有当前操作的权限
  @param data.user 用户对象
  @param data.userRoles 用户所有的角色
  @param data.operationId 操作名
  @return boolean 是否有权限
  @author pengxiguaa 2019/1/25
*/
forumSchema.methods.ensureModeratorsPermission = async function(data) {
  const {user, userRoles, operationId} = data;
  let hasOperation = false;
  for(const role of userRoles) {
    if(role._id !== 'moderator' && role.operationsId.includes(operationId)) {
      hasOperation = true;
      break;
    }
  }
  if(hasOperation) return;
  // 若没有权限，则判断用户是否为专家
  const isModerator = await this.isModerator(user);
  if(!isModerator) {
    const err = new Error('权限不足');
    err.status = 403;
    throw err;
  }
};

/*
  获取相关专业
  @param fids 能够看到入口的专业，若为空则不考虑权限
  @return 专业对象数组
  @author pengxiguaa 2019/1/24
*/
forumSchema.methods.extendRelatedForums = async function(fids) {
  const ForumModel = mongoose.model('forums');
  let relatedForumsId;
  if(!fids) {
    relatedForumsId = this.relatedForumsId;
  } else {
    relatedForumsId = this.relatedForumsId.filter(fid => fids.includes(fid))
  }
  const relatedForums = await ForumModel.find({fid: {$in: relatedForumsId}});
  return this.relatedForums = relatedForums;
};

/*
* 加载专业列表，树形结构，并只保留了基本信息（fid，forumType, iconFileName, displayName, parentsId, color）
* @param {[object]} userRoles 用户的证书对象所组成的数组
* @param {object} userGrade 用户的等级对象
* @param {object} user 用户对象
* @author pengxiguaa 2019-4-18
* @return {[object]} 专业对象所组成的数组
* */
forumSchema.statics.getForumsTree = async (userRoles, userGrade, user) => {
  const ForumModel = mongoose.model("forums");
  let fid = await ForumModel.visibleFid(userRoles, userGrade, user);
  let forums = await ForumModel.find({
    fid: {
      $in: fid
    }
  }, {
    fid: 1,
    displayName: 1,
    forumType: 1,
    allowedAnonymousPost: 1,
    color: 1,
    countThreads: 1,
    countPosts: 1,
    parentsId: 1,
    categoryId: 1,
    iconFileName: 1,
    logo: 1,
    banner: 1,
    description: 1
  }).sort({order: 1});
  const forumsObj = {};
  forums = forums.map(forum => {
    forum = forum.toObject();
    forum.childrenForums = [];
    forumsObj[forum.fid] = forum;
    return forum;
  });

  for(let forum of forums) {
    for(const fid of forum.parentsId) {
      const parentForum = forumsObj[fid];
      if(parentForum) {
        parentForum.childrenForums.push(forum);
      }
    }
  }
  const result = [];
  for(let forum of forums) {
    if(forum.parentsId.length === 0) {
      result.push(forum);
    }
  }
  return result;
};

/*
* 获取专业树状结构，仅显示前两层
* @param {[object]} userRoles 用户的证书对象所组成的数组
* @param {object} userGrade 用户的等级对象
* @param {object} user 用户对象
* @return {[Object]} 专业树状结构
* @author pengxiguaa 2019-6-25
* */
forumSchema.statics.getForumsTreeLevel2 = async (userRoles, userGrade, user) => {
  const ForumModel = mongoose.model("forums");
  let fid = await ForumModel.visibleFid(userRoles, userGrade, user);
  let forums = await ForumModel.find({
    fid: {
      $in: fid
    }
  }, {
    fid: 1,
    displayName: 1,
    forumType: 1,
    color: 1,
    parentsId: 1,
    countPosts: 1,
    countThreads: 1,
    iconFileName: 1,
    categoryId: 1,
    description: 1,
    logo: 1,
    banner: 1,
  }).sort({order: 1});

  const forumsObj = {};
  forums = forums.map(forum => {
    forum = forum.toObject();
    forum.childrenForums = [];
    forumsObj[forum.fid] = forum;
    return forum;
  });

  const results = [];

  for(const f of forums) {
    if(!f.parentsId.length) {
      results.push(f);
    } else {
      f.parentsId.map(fid => {
        const parentForum = forumsObj[fid];
        if(!parentForum) return;
        parentForum.childrenForums.push(f);
      });
    }
  }

  for(const forum of forums) {
    // 拓展最新文章
    if(!forum.childrenForums.length) {
      forum.latestThreads = await ForumModel.getLatestThreadsFromRedis(forum.fid);
    } else {
      forum.latestThreads = [];
    }
  }

  return results;

  /*
  const insetForums = (childrenForums, fid) => {
    let arr = [];
    for(const f of forums) {
      if(f.parentsId.includes(fid)) {
        childrenForums.push(f);
        arr.push(f);
      }
    }
    for(const f of arr) {
      insetForums(childrenForums, f.fid);
    }
  };

  const results = [];
  for(const f of forums) {
    if(!f.parentsId.length) {
      results.push(f);
      insetForums(f.childrenForums, f.fid);
    }
  }

  return results;*/
};

/**
 * 获取新的专业树形结构
 */
forumSchema.statics.getForumsNewTree = async (userRoles, userGrade, user) => {
  const ForumModel = mongoose.model("forums");
  const SubscribeModel = mongoose.model("subscribes");
  const ThreadTypeModel = mongoose.model("threadTypes");
  const threadTypes = await ThreadTypeModel.find({});
  let fid = await ForumModel.visibleFid(userRoles, userGrade, user);
  const subForums = await SubscribeModel.find({cancel: false, type: "forum", uid: user.uid});
  let forums = await ForumModel.find({
    fid: {
      $in: fid
    }
  }, {
    fid: 1,
    displayName: 1,
    parentsId: 1,
  }).sort({order: 1});

  const forumsObj = {};
  forums = forums.map(forum => {
    forum = forum.toObject();

    forum.id = forum.fid;
    forum.name = forum.displayName;
    forum.son = [];
    forum.childrenForums = [];
    forumsObj[forum.fid] = forum;
    return forum;
  });

  for(let forum of forums) {
    for(const fid of forum.parentsId) {
      const parentForum = forumsObj[fid];
      if(parentForum) {
        parentForum.childrenForums.push(forum);
        parentForum.son.push(forum);
      }
    }
    for(const cate of threadTypes) {
      if(cate.fid == forum.fid) {
        forum.son.push({
          id: "c"+cate.cid,
          name: cate.name,
          son:[]
        })
      }
    }
  }
  for(let forum of forums) {
    if(forum.childrenForums.length == 0) {
      forum.son.push({
        id: "",
        name: "不分类",
        son: []
      })
    }
  }
  // 我关注的
  const mySubForums = {
    id: "mySub",
    name: "我关注的",
    son:[]
  }
  for(let subf of subForums) {
    for(let forum of forums) {
      if(forum.fid == subf.fid){
        mySubForums.son.push(forum)
      }
    }
  }

  const result = [];
  for(let forum of forums) {
    if(forum.parentsId.length === 0) {
      result.push(forum);
    }
  }
  if(mySubForums.son.length > 0) {
    result.unshift(mySubForums)
  }
  return result;
};

/*
* 获取用户关注的专业
* @param {String} uid 用户ID
* @param {[String]} fid 用户可从中获取文章的专业ID
* @author pengxiguaa 2019-4-28
* */
forumSchema.statics.getUserSubForums = async (uid, fid) => {
  const SubscribeModel = mongoose.model("subscribes");
  const ForumModel= mongoose.model('forums');
  let fids = await SubscribeModel.getUserSubForumsId(uid);
  fids = fids.filter(f => fid.includes(f));
  const subForums = await ForumModel.find({
    fid: {
      $in: fids
    }
  }, {
    fid: 1,
    displayName: 1,
    forumType: 1,
    color: 1,
    parentsId: 1,
    iconFileName: 1,
    logo: 1,
    banner: 1,
    description: 1
  });
  const userSubForums = [];
  subForums.map(forum => {
    const index = fid.indexOf(forum.fid);
    userSubForums[index] = forum;
  });
  return userSubForums.filter(f => !!f);
};
forumSchema.statics.getUserSubForumsId = async (uid, fid) => {
  const forums = await mongoose.model("forums").getUserSubForums(uid, fid);
  return forums.map(f => f.fid);
};
/**
 * 判断专业发表权限，是否允许在此专业下发表文章
 * @param {Array} fids 专业id数组
 * @param {Object} data
 */
forumSchema.statics.publishPermission = async (data, fids) => {
  const ForumModel = mongoose.model("forums");
  const {userRoles, userGrade, user} = data;
  const forums = await ForumModel.find({fid: {$in: fids}});
  for(const f of forums) {
    await f.ensurePermission(userRoles, userGrade, user);
    let childrenForums = await f.extendChildrenForums();
    if(childrenForums.length !== 0) {
      throwErr(400, "该专业下存在其他专业，请到下属专业发表文章");
    }
  }
}

/**
 * -------
 * 生成一条新的thread
 * -------
 * @description ：使用该方法可新生成一条新的thread，并调用newPost方法生成firstPost。
 *
 * @param {Object} options
 * @参数说明 options对象中必要参数
 * | uid   --  用户ID
 * | fids  --  目标专业的fid数组集合，不可为空
 * | 其余未作说明的参数为非必要
 *
 * @return {Object} _post 返回一个包含pid、tid等的post，便于后续的业务逻辑中使用
 *
 * @author Kris 2019-06-10
 */
forumSchema.statics.createNewThread = async function(options) {
  if(!options.uid) throwErr(400, "uid不可为空");
  if(!options.fids || options.fids.length === 0) throwErr(400, "目标专业fids不可为空");
  const SettingModel = mongoose.model('settings');
  const SubscribeModel = mongoose.model("subscribes");
  const ThreadModel = mongoose.model('threads');
  const ForumModel = mongoose.model('forums');
  const tid = await SettingModel.operateSystemID('threads', 1);
  const t = {
    tid,
    categoriesId: options.cids,
    mainForumsId: options.fids,
    // mid: options.uid,
    uid: options.uid,
    type: options.type
  };
  // 专栏相关，暂时保留，并不启用
  // --------
  // if(toMid && toMid !== data.user.uid) {
  //   const targetPF = await PersonalForumModel.findOnly({uid: toMid});
  //   if(targetPF.moderators.indexOf(data.user.uid) > -1)
  //     t.toMid = toMid;
  //   else
  //     throw (new Error("only personal forum's moderator is able to post"))
  // }
  // --------
  const thread = await new ThreadModel(t).save();
  options.postType = "thread";
  const _post = await thread.createNewPost(options);
  await thread.updateOne({$set:{lm: _post.pid, oc: _post.pid, count: 0, hits: 0}});
  await ForumModel.updateCount([thread], true);
  return _post;
};
/*
* 将指定类型的专业ID存入redis
* @param {String} forumType topic: 话题, discipline: 学科
* @return [[String]] 话题ID数组
* @author pengxiguaa 2019-8-1
* */
forumSchema.statics.saveForumsIdToRedis = async (forumType) => {
  const ForumModel = mongoose.model("forums");
  const forums = await ForumModel.find({forumType}, {fid: 1});
  const forumsId = forums.map(t => t.fid);
  setImmediate(async () => {
    const key = `forums:${forumType}sId`;
    await client.resetSetAsync(key, forumsId);
    /*await client.delAsync(key);
    if(forumsId.length) {
      await client.saddAsync(key, forumsId);
    }*/
  });
  return forumsId
};
/*
* 从redis获取指定类型的专业ID
* @param {String} forumType topic: 话题, discipline: 学科
* @return [[String]] 话题ID数组
* @author pengxiguaa 2019-8-1
* */
forumSchema.statics.getForumsIdFromRedis = async (forumType) => {
  let forumsId = await client.smembersAsync(`forums:${forumType}sId`);
  if(!forumsId.length) {
    forumsId = await mongoose.model("forums").saveForumsIdToRedis(forumType);
  }
  return forumsId;
};
/*
  创建文库
  @param {String} uid 创建者ID
  @return {Object} 文库对象
  @author pengxiguaa 2019-10-21
*/
forumSchema.methods.createLibrary = async function(uid) {
  if(this.lid) throwErr(500, "专业文库已存在，fid: ${this.fid}, lid: ${this.lid}");
  const library = await mongoose.model("libraries").newFolder({
    name: this.displayName,
    description: this.description,
    uid
  });
  await this.updateOne({lid: library._id});
  return library;
};


/*
* 获取首页推荐专业
* @param {[String]} fid 可以访问的专业ID组成的数组
* @return {[Object]} 专业对象组成的数组
* @author pengxiguaa 2019-11-29
* */
forumSchema.statics.getRecommendForums = async (fid = []) => {
  const homeSettings = await mongoose.model("settings").getSettings("home");
  const {recommendForumsId} = homeSettings;
  const forums = await mongoose.model("forums").find({fid: {$in: recommendForumsId.filter(f => fid.includes(f))}});
  const forumsIndex = require("../nkcModules/apiFunction").getRandomNumber({
    count: forums.length,
    min: 0,
    max: forums.length - 1>0?forums.length - 1:0,
    repeat: false
  });
  return forumsIndex.map(index => {
    return forums[index];
  });

};

/*
* 获取某个专业的层级导航
* @param {[String]} fids 当前用户能访问的专业ID所组成的数组
* @param {String} fid 专业ID
* */
forumSchema.statics.getForumNav = async (fid) => {
  const ForumModel = mongoose.model("forums");
  const forums = await ForumModel.getAllForumsFromRedis();
  const forumsObj = {};
  forums.map(f => forumsObj[f.fid] = f);
  const results = [];
  const func = (results, fid) => {
    const forum = forumsObj[fid];
    if(!forum) return;
    results.unshift(forum);
    if(forum.parentsId && forum.parentsId[0]) {
      func(results, forum.parentsId[0]);
    }
  };
  func(results, fid);
  return results;
};
/*
* 通过fid数组获取专业对象数组
* @param {[String]} fid fid数组
* @return {[Object]} 专业对象数组
* */
forumSchema.statics.getForumsByFid = async (fid) => {
  const ForumModel = mongoose.model("forums");
  const visitedForums = await ForumModel.find({fid: {$in: fid}});
  const visitedForumsObj = {};
  visitedForums.map(forum => visitedForumsObj[forum.fid] = forum);
  const results = [];
  for(const id of fid) {
    const forum = visitedForumsObj[id];
    if(forum) results.push(forum);
  }
  return results;
};

/*
* 缓存专业最新3篇文章到redis
* @param {Number} count 需要缓存的文章数量
* @author pengxiguaa 2020/7/29
* */
forumSchema.methods.saveLatestThreadToRedisAsync = async function(count) {
  const self = this;
  setImmediate(async () => {
    await self.saveLatestThreadToRedis(count);
  });
};
forumSchema.methods.saveLatestThreadToRedis = async function(count = 3) {
  const fid = this.fid;
  const ThreadModel = mongoose.model('threads');
  const nkcRender = require('../nkcModules/nkcRender');
  const PostModel = mongoose.model('posts');
  const UserModel = mongoose.model('users');
  const threads = await ThreadModel.find({
    disabled: false,
    reviewed: true,
    recycleMark: {$ne: true},
    mainForumsId: fid,
  }, {
    tid: 1, oc: 1, uid: 1, hits: 1, count: 1, toc: 1, digest: 1, tlm: 1
  }).sort({tlm: -1}).limit(count);
  const postsId = [], usersId = [];
  threads.map(t => {
    postsId.push(t.oc);
    usersId.push(t.uid);
  });
  const posts = await PostModel.find({pid: {$in: postsId}}, {pid: 1, t: 1, voteUp: 1, anonymous: 1});
  const users = await UserModel.find({uid: {$in: usersId}}, {username: 1, uid: 1});
  const postsObj = {}, usersObj = {};
  posts.map(p => postsObj[p.pid] = p);
  users.map(u => usersObj[u.uid] = u);
  const results = [];
  for(const thread of threads) {
    const {tid, tlm, oc, uid, hits, count, toc, digest} = thread;
    const post = postsObj[oc];
    const user = usersObj[uid];
    if(!post || !user) continue;
    if(post.anonymous) {
      user.username = '匿名用户';
      user.uid = '';
    }
    post.t = nkcRender.replaceLink(post.t);
    results.push({
      tid,
      digest,
      toc,
      tlm,
      hits,
      count,
      post,
      user
    });
  }
  const key = `forum:${fid}:latestThreads`;
  await client.setAsync(key, JSON.stringify(results));
};
/*
* 更新指定fid的专业的最新文章到redis
* @param {String} fid 专业ID
* @param {Number} count 文章数量
* @author pengxiguaa 2020/7/29
* */
forumSchema.statics.saveLatestThreadToRedis = async (fid, count) => {
  const ForumModel = mongoose.model('forums');
  const forum = await ForumModel.findOne({fid});
  if(!forum) return;
  await forum.saveLatestThreadToRedis(count);
};
/*
* 异步更新redis中所有专业的最新文章
* @param {Number} count 最新文章的数量
* @author pengxiguaa 2020/7/29
* */
forumSchema.statics.saveAllForumLatestThreadToRedis = async (count) => {
  const ForumModel = mongoose.model('forums');
  const forums = await ForumModel.find({});
  for(const forum of forums) {
    await forum.saveLatestThreadToRedis(count);
  }
}
forumSchema.statics.saveAllForumLatestThreadToRedisAsync = async (count) => {
  const ForumModel = mongoose.model('forums');
  setImmediate(async () => {
    await ForumModel.saveAllForumLatestThreadToRedis(count);
  });
};
/*
* 从redis获取专业最新文章
* @param {String} fid 专业ID
* @return {[Object]} [thread, ...];
* */
forumSchema.statics.getLatestThreadsFromRedis = async (fid) => {
  const key = `forum:${fid}:latestThreads`;
  const threadsString = await client.getAsync(key);
  return JSON.parse(threadsString);
};

/*
* 保存所有的专业到redis
* @author pengxiguaa 2020/8/25
* */
forumSchema.statics.saveAllForumsToRedis = async () => {
  const ForumModel = mongoose.model('forums');
  const forums = await ForumModel.find().sort({order: 1});
  for(const _forum of forums) {
    const forum = _forum.toObject();
    const key = getRedisKeys(`forumData`, forum.fid);
    await client.setAsJsonString(key, forum);
    // await client.setAsync(key, JSON.stringify(forum));
  }
  // 保存所有专业的id到redis
  await ForumModel.saveAllForumsIdToRedis(forums);
};
/*
* 保存所有以下数据到redis
* 1. 所有专业的ID
* 2. 已开启专业的ID
* 3. 导航可见的专业的ID
* 4. 无权用户导航的专业的ID
* 5. 在上级板块显示文章的专业ID
* 6. 在搜索页显示文章的专业ID
* @author pengxiguaa 2020/8/25
* */
forumSchema.statics.saveAllForumsIdToRedis = async (forums) => {
  const ForumModel = mongoose.model('forums');
  let forumsId = [],
    accessibleForumsId = [],
    visibilityForumsId = [],
    isVisibilityNCCForumsId = [],
    displayOnParentForumsId = [],
    displayOnSearchForumsId = [];
  if(!forums) {
    forums = await ForumModel.find({}, {
      fid: 1,
      accessible: 1,
      visibility: 1,
      isVisibilityNCC: 1,
      displayOnParent: 1,
      displayOnSearch: 1
    }).sort({order: 1});
  }
  for(const forum of forums) {
    const {
      fid, accessible,
      visibility,
      isVisibilityNCC,
      displayOnParent,
      displayOnSearch
    } = forum;
    forumsId.push(fid);
    // 总开关
    if(accessible) {
      accessibleForumsId.push(fid);
      // 导航可见
      if(visibility) {
        visibilityForumsId.push(fid);
        // 无权用户导航可见
        if(isVisibilityNCC) {
          isVisibilityNCCForumsId.push(fid);
        }
      }
      // 在上级板块显示文章
      if(displayOnParent) {
        displayOnParentForumsId.push(fid);
      }
      // 在搜索页显示文章
      if(displayOnSearch) {
        displayOnSearchForumsId.push(fid);
      }
    }
  }
  await client.setArray(getRedisKeys(`forumsId`), forumsId);
  await client.setArray(getRedisKeys('accessibleForumsId'), accessibleForumsId);
  await client.setArray(getRedisKeys('visibilityForumsId'), visibilityForumsId);
  await client.setArray(getRedisKeys('isVisibilityNCCForumsId'), isVisibilityNCCForumsId);
  await client.setArray(getRedisKeys('displayOnParentForumsId'), displayOnParentForumsId);
  await client.setArray(getRedisKeys('displayOnSearchForumsId'), displayOnSearchForumsId);
};
/*
* 从redis获取所有专业的id
* @return {[String]} [fid, fid, ...]
* @author pengxiguaa 2020/8/25
* */
forumSchema.statics.getAllForumsIdFromRedis = async () => {
  return await client.getArray(getRedisKeys('forumsId'));
};

/*
* 获取所有专业
* @return {[Object]} 专业对象组成的数组
* @author pengxiguaa 2020/8/25
* */
forumSchema.statics.getAllForumsFromRedis = async () => {
  const ForumModel = mongoose.model('forums');
  const forumsId = await ForumModel.getAllForumsIdFromRedis();
  const forums = [];
  for(const fid of forumsId) {
    const key = getRedisKeys(`forumData`, fid);
    const forum = await client.getFromJsonString(key);
    if(!forum) continue;
    forums.push(forum);
  }
  return forums;
};

/*
* 缓存整个专业信息到redis
* @param {String} fid
* @author pengxiguaa 2020/8/25
* */
forumSchema.statics.saveForumToRedis = async (fid) => {
  const ForumModel = mongoose.model('forums');
  let forum = await ForumModel.findOne({fid});
  if(!forum) throwErr(500, `专业不存在 fid: ${fid}`);
  forum = forum.toObject();
  const key = getRedisKeys('forumData', forum.fid);
  await client.setAsJsonString(key, forum);
  await ForumModel.saveAllForumsIdToRedis();
};

/*
* 从redis获取单个专业
* @param {String} fid 专业ID
* @return {Object} 专业信息
* @author pengxiguaa 2020/8/25
* */
forumSchema.statics.getForumByIdFromRedis = async (fid) => {
  const key = getRedisKeys(`forumData`, fid);
  return await client.getFromJsonString(key);
};


/*
* 检查用户在指定专业的权限
* @param {String} type 执行权限类型 write: 发表, read: 阅读
* @param {String} uid 用户ID
* @param {[String]} fid 专业ID组成的数组
* */
forumSchema.statics.checkPermission = async (type, user, fid = []) => {
  const SettingModel = mongoose.model('settings');
  const recycleId = await SettingModel.getRecycleId();
  const ForumModel = mongoose.model('forums');
  const {grade: userGrade, roles: userRoles, uid} = user;
  const userRolesId = userRoles.map(r => r._id);
  const userGradeId = userGrade? userGrade._id: null;
  for(const id of fid) {
    if(['write', 'writePost'].includes(type) && id === recycleId) throwErr(400, `不允许发表内容到回收站，请更换专业`);
    const forum = await ForumModel.getForumByIdFromRedis(id);
    if(!forum) throwErr(400, `专业id错误 fid: ${id}`);
    // 发表文章，只允许发表到最底层专业
    if(type === 'write') {
      const childForumsId = await ForumModel.getAllChildForumsIdByFid(forum.fid);
      if(childForumsId.length) throwErr(400, `不允许在父专业发表文章 fid: ${forum.fid}`);
    }
    if(uid && forum.moderators.includes(uid)) continue;
    const {accessible, permission, displayName} = forum;
    const {rolesId, gradesId, relation} = permission[type];
    if(!accessible) throwErr(`专业「${displayName}」暂未开放，请更换专业`);

    let hasRole = false, hasGrade = userGradeId !== null && gradesId.includes(userGradeId);
    for(const userRoleId of userRolesId) {
      if(rolesId.includes(userRoleId)) {
        hasRole = true;
        break;
      }
    }
    if(
      (relation === 'or' && !hasRole && !hasGrade) ||
      (relation === 'and' && (!hasRole || !hasGrade))
    ) {
      if(type === 'read') {
        throwErr(403, `你没有权限阅读专业「${displayName}」下的内容，请更换专业。`);
      } else if(type === 'write') {
        throwErr(403, `你没有权限在专业「${displayName}」下发表文章，请更换专业。`);
      } else {
        throwErr(403, `你没有权限在专业「${displayName}」下发表回复或评论，请更换专业。`);
      }
    }
  }
};
/*
* 验证用户是否能在指定专业发表文章
* @param {[String]} 专业ID组成的数组
* @param {String} uid 用户ID
* @author pengxiguaa 2020/8/25
* */
forumSchema.statics.checkWritePermission = async (uid, fid) => {
  const ForumModel = mongoose.model('forums');
  await ForumModel.checkGlobalPostPermission(uid, 'thread');
  const user = await mongoose.model('users').findOnly({uid});
  await user.extendRoles();
  await user.extendGrade();
  await ForumModel.checkPermission('write', user, fid);
};

/*
* 验证用户是否能在指定的专业发表回复和评论
* @param {[String]} 专业ID组成的数组
* @param {String} uid 用户ID
* @author pengxiguaa 2020/8/25
* */
forumSchema.statics.checkWritePostPermission = async (uid, fid) => {
  const ForumModel = mongoose.model('forums');
  await ForumModel.checkGlobalPostPermission(uid, 'post');
  const user = await mongoose.model('users').findOnly({uid});
  await user.extendRoles();
  await user.extendGrade();
  await ForumModel.checkPermission('writePost', user, fid);
}

/*
* 根据后台管理-发表设置验证用户是拥有发表全向
* @param {String} uid 用户ID
* @param {String} postType 内容类型 post: 回复、评论, thread: 文章
* */
forumSchema.statics.checkGlobalPostPermission = async (uid, type) => {
  const UserModel = mongoose.model('users');
  const SettingModel = mongoose.model('settings');
  const PostModel = mongoose.model('posts');
  const apiFunction = require('../nkcModules/apiFunction');
  const settingsType = {
    'thread': {
      key: 'postToForum',
      name: '文章'
    },
    'post': {
      key: 'postToThread',
      name: '回复/评论'
    }
  }[type];
  if(!settingsType) throwErr(500, `发表类型错误 type: ${type}`);
  const user = await UserModel.findOne({uid});
  if(!user) throwErr(500, `未找到用户 uid: ${uid}`);
  await user.ensureUserInfo();
  const postSettings = await SettingModel.getSettings('post');
  let {
    authLevelMin,
    exam,
  } = postSettings[settingsType.key];
  const {
    volumeA, volumeB, notPass
  } = exam;
  const {
    status, countLimit, unlimited
  } = notPass;
  const userLevel = await user.extendAuthLevel();
  authLevelMin = Number(authLevelMin);
  if(userLevel < authLevelMin) {
    throwErr(403, `身份认证等级未达要求，发表${settingsType.name}至少需要完成身份认证 ${authLevelMin}`)
  }
  const today = apiFunction.today();
  const todayCount = await PostModel.countDocuments({toc: {$gte: today}, uid: user.uid, type});
  if((!volumeB || !user.volumeB) && (!volumeA || !user.volumeA)) { // a, b考试未开启或用户未通过
    if(!status) throwErr(403, '权限不足，请提升账号等级');
    if(!unlimited && countLimit <= todayCount) throwErr(403, `今日发表${settingsType.name}次数已用完，请明天再试。`);
  }
  // 发表回复时间、条数限制
  let postCountLimit, postTimeLimit;
  const {
    postToForumCountLimit,
    postToForumTimeLimit,
    postToThreadCountLimit,
    postToThreadTimeLimit
  } = await user.getPostLimit();
  if(type === 'post') {
    postCountLimit = postToThreadCountLimit;
    postTimeLimit = postToThreadTimeLimit;
  } else {
    postCountLimit = postToForumCountLimit;
    postTimeLimit = postToForumTimeLimit;
  }
  if(todayCount >= postCountLimit) throwErr(400, `你当前的账号等级每天最多只能发表${postCountLimit}篇${settingsType.name}，请明天再试。`);
  const latestPost = await PostModel.findOne({type, uid: user.uid, toc: {$gte: (Date.now() - postTimeLimit * 60 * 1000)}}, {pid: 1});
  if(latestPost) throwErr(400, `你当前的账号等级限定发表${settingsType.name}间隔时间不能小于${postTimeLimit}分钟，请稍后再试。`);
};


/*
* 验证用户是否有权阅读指定专业
* @param {String} uid 用户ID
* @param {[String]} [fid, fid, ...] 专业ID
* */
forumSchema.statics.checkReadPermission = async (uid, fid) => {
  const RoleModel = mongoose.model('roles');
  const UserModel = mongoose.model('users');
  let user;
  if(uid === null) {
    const visitorRole = await RoleModel.extendRole('visitor');
    user = {
      uid: null,
      grade: null,
      roles: [visitorRole]
    }
  } else {
    user = await UserModel.findOnly({uid});
    await user.extendRoles();
    await user.extendGrade();
  }
  await mongoose.model('forums').checkPermission('read', user, fid);
};
/*
* 获取有权执行指定操作的专业ID
* @param {String} uid 用户ID
* @param {String} type 操作类型
* @return {[String]} 专业ID
* @author pengxiguaa 2020/9/8
* */
forumSchema.statics.getForumsIdByUidAndType = async (uid, type) => {
  const ForumModel = mongoose.model('forums');
  const RoleModel = mongoose.model('roles');
  const UserModel = mongoose.model('users');
  let user;
  if(!uid) {
    const visitorRole = await RoleModel.extendRole('visitor');
    user = {
      uid: null,
      grade: null,
      roles: [visitorRole]
    }
  } else {
    user = await UserModel.findOnly({uid});
    await user.extendRoles();
    await user.extendGrade();
  }
  const forumsId = await ForumModel.getAllForumsIdFromRedis();
  const results = [];
  for(const fid of forumsId) {
    try{
      await ForumModel.checkPermission(type, user, [fid]);
      results.push(fid);
    } catch(err) {}
  }
  return results;
};
/*
* 通过fid数组从数据库获取forum对象
* @param {[String]} forumsId 专业ID组成的数组
* @return {[Object]} 专业对象组成的数组
* @author pengxiguaa 2020/9/8
* */
forumSchema.statics.getForumsByIdFromRedis = async (forumsId = []) => {
  const ForumModel = mongoose.model('forums');
  const results = [];
  for(const fid of forumsId) {
    const forum = await ForumModel.getForumByIdFromRedis(fid);
    if(!forum) continue;
    results.push(forum);
  }
  return results;
};
/*
* 获取用户能够访问的专业
* @param {String} uid 用户ID
* @return {[String]} 可访问的专业
* */
forumSchema.statics.getReadableForumsIdByUid = async (uid) => {
  const ForumModel = mongoose.model('forums');
  return await ForumModel.getForumsIdByUidAndType(uid, 'read');
};
/*
* 获取用户能够发表文章的专业
* @param {String} uid 用户ID
* @return {[String]} 可发表文章的专业
* */
forumSchema.statics.getWritableForumsIdByUid = async (uid) => {
  const ForumModel = mongoose.model('forums');
  return await ForumModel.getForumsIdByUidAndType(uid, 'write');
};
/*
* 获取已开启的专业ID
* @return {[String]}
* @author pengxiguaa 2020/8/27
* */
forumSchema.statics.getAccessibleForumsIdFromRedis = async () => {
  const key = getRedisKeys('accessibleForumsId');
  return await client.getArray(key);
};
/*
* 获取导航可见的专业ID
* @return {[String]}
* @author pengxiguaa 2020/8/27
* */
forumSchema.statics.getVisibilityForumsIdFromRedis = async () => {
  const key = getRedisKeys('visibilityForumsId');
  return await client.getArray(key);
};
/*
* 获取无权用户导航可见的专业ID
* @return {[String]}
* @author pengxiguaa 2020/8/27
* */
forumSchema.statics.getIsVisibilityNCCForumsIdFromRedis = async () => {
  const key = getRedisKeys('isVisibilityNCCForumsId');
  return await client.getArray(key);
};
/*
* 获取可在上层专业显示文章的专业ID
* @return {[String]}
* @author pengxiguaa 2020/8/27
* */
forumSchema.statics.getDisplayOnParentForumsIdFromRedis = async () => {
  const key = getRedisKeys('displayOnParentForumsId');
  return await client.getArray(key);
};
/*
* 获取可在搜索页显示文章的专业ID
* @return {[String]}
* @author pengxiguaa 2020/8/27
* */
forumSchema.statics.getDisplayOnSearchForumsIdFromRedis = async () => {
  const key = getRedisKeys('displayOnSearchForumsId');
  return await client.getArray(key);
};


/*
* 获取专业页的专业链导航
* @param {String} cid 文章分类ID
* @return {[Object]}
* @author pengxiguaa 2020/9/1
* */
forumSchema.methods.getForumNav = async function(cid) {
  const ForumModel = mongoose.model('forums');
  const ThreadTypeModel = mongoose.model('threadTypes');
  const forums = [];
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
  await getParentForum(this.parentsId);
  forums.push({
    fid: this.fid,
    name: this.displayName
  });
  if(cid) {
    const category = await ThreadTypeModel.findOne({fid: this.fid, cid: Number(cid)});
    if(category) {
      forums.push({
        fid: this.fid,
        cid,
        name: category.name
      });
    }
  }
  return forums;
};
/*
* 获取专业选择器可显示的专业
* @param {String} uid 用户ID
* @param {String} from 专业来源 writable: 可发表文章的, readable: 可阅读的
* */
forumSchema.statics.getForumSelectorForums = async (uid, from) => {
  const ForumModel = mongoose.model('forums');
  const ThreadTypeModel = mongoose.model('threadTypes');
  const readableForumsId = await ForumModel.getReadableForumsIdByUid(uid);
  const writableForumsId = await ForumModel.getWritableForumsIdByUid(uid);
  const forums = await ForumModel.getForumsByIdFromRedis(readableForumsId);
  const types = await ThreadTypeModel.find().sort({order: 1});
  const childForums = {};
  const threadTypes = {};
  for(let t of types) {
    t = t.toObject();
    if(!threadTypes[t.fid]) threadTypes[t.fid] = [];
    threadTypes[t.fid].push(t);
  }
  const mainForums = [];
  for(const forum of forums) {
    forum.threadTypes = threadTypes[forum.fid] || [];
    if(!childForums[forum.fid]) {
      forum.childForums = [];
      childForums[forum.fid] = forum.childForums;
    } else {
      forum.childForums = childForums[forum.fid];
    }
    if(forum.parentsId.length) {
      for(const pfid of forum.parentsId) {
        if(!childForums[pfid]) childForums[pfid] = [];
        childForums[pfid].push(forum);
      }
    } else {
      mainForums.push(forum);
    }
  }
  const getForumChildForums = async (results, arr) => {
    for(const ff of arr) {
      const childForumsId = await ForumModel.getAllChildForumsIdByFid(ff.fid);
      if(childForumsId.length === 0) {
        if(
          (from === 'writable' && writableForumsId.includes(ff.fid)) ||
          from === 'readable'
        ) {
          results.push(ff);
        }
      } else {
        await getForumChildForums(results, ff.childForums);
      }
    }
  };
  const results = [];
  for(const forum of mainForums) {
    const cf = [];
    await getForumChildForums(cf, forum.childForums);
    forum.childForums = cf;
    const childForumsId = await ForumModel.getAllChildForumsIdByFid(forum.fid);
    if(cf.length === 0 && childForumsId.length !== 0) {
      continue;
    }
    results.push(forum);
  }
  return results;
};

/*
* 发表文章时，判断专业数量、互斥是否符合要求
* @param {[String]} fids 专业数组
* @author pengxiguaa 2020/9/8
* */
forumSchema.statics.checkForumCategoryBeforePost = async (_fids) => {
  const fids = [].concat(_fids);
  if(fids.length === 0) throwErr(400, '专业ID不能为空');
  const ForumModel = mongoose.model('forums');
  const ForumCategoryModel = mongoose.model('forumCategories');
  const categoriesId = [];
  for(const fid of fids) {
    const forum = await ForumModel.getForumByIdFromRedis(fid);
    if(!forum) throwErr(400, `专业ID错误 fid: ${fid}`);
    categoriesId.push(forum.categoryId);
  }
  const SettingModel = mongoose.model('settings');
  const postSettings = await SettingModel.getSettings('post');
  const {min, max} = postSettings.postToForum.minorForumCount;
  const mainForumId = fids.shift();
  const minorForumId = fids;
  if(minorForumId.length < min || minorForumId.length > max) throwErr(400, `专业分类辅分类数量不符合要求`);
  // 以下检测专业分类冲突
  const categories = await ForumCategoryModel.getAllCategories();
  const categoriesObj = {};
  categories.map(c => categoriesObj[c._id] = c);
  let _categories = [];
  for(const cid of categoriesId) {
    const category = categoriesObj[cid];
    if(!category) continue;
    _categories.push(category);
  }
  for(let i = 0; i < _categories.length; i++) {
    for(let j = 0; j < _categories.length; j++) {
      const c = _categories[i];
      const cc = _categories[j];
      if(i === j || !c.excludedCategoriesId.includes(cc._id)) continue;
      if(c._id === cc._id) {
        throwErr(400, `专业分类「${c.name}」下不允许选择多个专业，请重新选择`);
      } else {
        throwErr(400, `不允许同时选择「${c.name}」与「${cc.name}」下的专业，请重新选择`);
      }
    }
  }
};


/**
 * 创建专业
 */
forumSchema.statics.createForum = async (displayName, type ="forum") => {
  if(!displayName) throwErr(400, '名称不能为空');
  let ForumModel = mongoose.model("forums");
  let ForumCategoryModel = mongoose.model('forumCategories');
  let SettingModel = mongoose.model('settings');
  const sameDisplayNameForum = await ForumModel.findOne({displayName});
  if(sameDisplayNameForum) throwErr(400, '名称已存在');
  let _id;
  while(1) {
    _id = await SettingModel.operateSystemID('forums', 1);
    const sameIdForum = await ForumModel.findOne({fid: _id});
    if(!sameIdForum) {
      break;
    }
  }
  const forumCategories = await ForumCategoryModel.getAllCategories();
  const newForum = ForumModel({
    fid: _id,
    categoryId: forumCategories[0]._id,
    displayName,
    accessible: true,
    visibility: false,
    rolesId: ['dev', 'default'],
    type
  });

  await newForum.save();
  // 更新专业缓存
  const cacheForums = require("../redis/cacheForums");
  await cacheForums();
  await ForumModel.saveForumToRedis(_id);
  return newForum;
};

/*
* 获取专业的高赞回复设置
* @return {Object}
*   @param {String} status hide, show 高赞列表的显示、隐藏
*   @param {Number} voteUpCount 最小点赞数
*   @param {Number} postCount 高赞回复数
*   @param {Number} selectedPostCount 选择的高赞回复数
* */
forumSchema.methods.getVoteUpPostSettings = async function() {
  if(this.voteUpPost.status === 'inherit') {
    const SettingModel = mongoose.model('settings');
    const threadSettings = await SettingModel.getSettings('thread');
    return threadSettings.voteUpPost;
  } else {
    return this.voteUpPost;
  }
}

module.exports = mongoose.model('forums', forumSchema);
