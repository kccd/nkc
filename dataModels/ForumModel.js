const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const client = settings.redisClient;


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
    default: '',
    maxlength: [300, '描述应少于300字']
  },
  displayName: {
    type: String,
    required: true,
    minlength: [1, '板块名称必须大于等于1字'],
    maxlength: [10, '板块名称必须小于等于10字']
  },
	brief: {
		type: String,
		default: '',
		maxlength: [15, '板块简介应少于15字']
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
	noticeThreadsId: {
		type: [String],
		default: []
	},
	iconFileName: {
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

  /* parentId: {
    type: String,
    default: ''
  }, */

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

  shareLimitTime: {
	  type: String,
    default: '720' // 小时
  },

  shareLimitCount: {
    type: String,
    default: '0' // 次数
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
	// 专业类型
	//--topic 话题
	//--discipline 学科
	forumType: {
		type: String,
		default: 'discipline'
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
	return this.basicThreads = await ThreadModel.extendThreads(threads);
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
	return this.valuableThreads = await ThreadModel.extendThreads(threads);
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
	return this.noticeThreads = await ThreadModel.extendThreads(threads);
};


forumSchema.methods.updateForumMessage = async function() {
	const ThreadModel = require('./ThreadModel');
	const ForumModel = mongoose.model('forums');
	const PostModel = mongoose.model('posts');
	const childrenFid = await ForumModel.getAllChildrenFid(this.fid);
	childrenFid.push(this.fid);
	const countThreads = await ThreadModel.count({fid: {$in: childrenFid}});
	let countPosts = await PostModel.count({fid: {$in: childrenFid}});
	countPosts = countPosts - countThreads;
	const digest = await ThreadModel.count({fid: {$in: childrenFid}, digest: true});
	const normal = countThreads - digest;
	const tCount = {
		digest,
		normal
	};
	const {today} = require('../nkcModules/apiFunction');
	const countPostsToday = await PostModel.count({fid: {$in: childrenFid}, toc: {$gt: today()}});
	await this.update({tCount, countPosts, countThreads, countPostsToday});
	let breadcrumbForums = await this.getBreadcrumbForums();
	breadcrumbForums = breadcrumbForums.reverse();
	for(let forum of breadcrumbForums) {
		const childForums = await forum.extendChildrenForums();
		let countThreads = 0, countPosts = 0, countPostsToday = 0, digest = 0;
		childForums.map(f => {
			countThreads += f.countThreads;
			countPosts += f.countPosts;
			countPostsToday += f.countPostsToday;
			digest += f.tCount.digest;
		});
		const tCount = {
			digest,
			normal: (countThreads - digest)
		};
		await forum.update({countThreads, countPosts, countPostsToday, tCount});
	}
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
  if(fid.length === 0) return fid;
  const forums_ = await ForumModel.find({fid: {$in: fid}});
  const forums = [];
  let lastForum;
  for(const forum of forums_) {
    let hasChild = false;
    const {fid} = forum;
    for(const f of forums_) {
      if(f.parentId === fid) {
        hasChild = true;
        break;
      }
    }
    if(hasChild) continue;
    lastForum = forum;
  }
  forums.push(lastForum);
  let n = 0;
  while(n < 1000 && forums.length !== fid.length) {
    n++;
    for(const forum of forums_) {
      if(forums[forums.length - 1].parentId === forum.fid) {
        forums.unshift(forum);
      }
    }
  }
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

  const mFid = await client.smembersAsync(`moderator:${uid}`);

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
forumSchema.statics.visibleForums = async (roles, grade, user) => {
  const ForumModel = mongoose.model('forums');
  const fid = await ForumModel.visibleFid(roles, grade, user);
  return await ForumModel.find({fid: {$in: fid}}).sort({order: 1});
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
  const key = `moderator:${uid}`;
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







forumSchema.methods.getAllChildForumsId = async function() {
  return await client.smembersAsync(`forum:${this.fid}:allChildForumsId`);
};



// 判断用户是否有权访问该版块
forumSchema.methods.ensurePermission = async function(roles, grade, user) {
  const ForumModel = mongoose.model('forums');
  const fid = await ForumModel.getAccessibleForumsId(roles, grade, user);
  if(!fid.includes(this.fid)) {
    const err = new Error('权限不足');
    err.status = 403;
    throw err;
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
      const f = await client.smembersAsync(`role:${roleId}`);
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

    const fidForUid = await client.smembersAsync(`moderator:${uid}`);

    fid = fid.concat(fidForUid);


    for(const roleId of rolesId) {
      const fidForRoleAndGrade = await client.smembersAsync(`role-grade:${roleId}-${gradeId}`);
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
  @param data.userRoles 用户所有用的角色
  @param data.operationId 操作名
  @return boolean 是否用户权限
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
}

module.exports = mongoose.model('forums', forumSchema);