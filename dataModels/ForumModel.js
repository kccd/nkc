const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

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
  parentId: {
    type: String,
    default: ''
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
  }
});

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

forumSchema.virtual('parentForum')
	.get(function() {
		return this._parentForum;
	})
	.set(function(parentForum) {
		this._parentForum = parentForum;
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
	for(let pid of basicThreadsId) {
		const thread = await ThreadModel.findOne({oc: pid});
		if(thread) {
			threads.push(thread);
		}
	}
	return this.basicThreads = threads;
};
// 值得阅读
forumSchema.methods.extendValuableThreads = async function() {
	const ThreadModel = mongoose.model('threads');
	const {valuableThreadsId} = this;
	const threads = [];
	for(let pid of valuableThreadsId) {
		const thread = await ThreadModel.findOne({oc: pid});
		if(thread) {
			threads.push(thread);
		}
	}
	return this.valuableThreads = threads;
};

// 公告
forumSchema.methods.extendNoticeThreads = async function() {
	const ThreadModel = mongoose.model('threads');
	const {noticeThreadsId} = this;
	const threads = [];
	for(let pid of noticeThreadsId) {
		const thread = await ThreadModel.findOne({oc: pid});
		if(thread) {
			await thread.extendFirstPost();
			threads.push(thread);
		}
	}
	return this.noticeThreads = threads;
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

// 加载子版块
forumSchema.methods.extendChildrenForums = async function(q) {
	const ForumModel = mongoose.model('forums');
	q = q || {};
	q.parentId = this.fid;
	return this.childrenForums = await ForumModel.find(q).sort({order: 1});
};

// 加载父板块
forumSchema.methods.extendParentForum = async function() {
	let parentForum;
	if(this.parentId) {
		const ForumModel = mongoose.model('forums');
		parentForum = await ForumModel.findOne({fid: this.parentId});
	}
	return this.parentForum = parentForum;
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

// 加载路径导航父专业
// 该专业的所有上层专业，未验证权限
// 若当前专业为第五级，则返回 [第一级, 第二级, 第三级, 第四级];
forumSchema.methods.getBreadcrumbForums = async function() {
	const ForumModel = mongoose.model('forums');
	const parentForums = [];
	let parentId = this.parentId;
	while(1) {
		if(parentId && parentId !== this.fid) {
			const parentForum = await ForumModel.findOnly({fid: parentId});
			parentId = parentForum.parentId;
			parentForums.push(parentForum);
		} else {
			break;
		}
	}
	return parentForums.reverse();
};

// -------------------------------- 加载能访问的板块 --------------------------------
forumSchema.statics.accessibleForums = async (options) => {
	// fid: String, 默认为null，查找某个专业下可访问的专业，默认从所有专业中查找。
	// grade: Number, 默认为0，查找该等级能访问的板块。
	// roles: [String]，默认为[]，查找这些角色能访问的板块。
	const ForumModel = mongoose.model('forums');
	let {fid, gradeId, rolesId, uid} = options;
	let moderatorFid = [];
	if(uid) {
		moderatorFid = await ForumModel.canManagerFid({uid, fid});
	}
	let accessibleForums = [];
	const findForums = async (parentId) => {
		const q = {
			parentId,
			accessible: true,
			$or: [
				{
					relation: 'and',
					gradesId: gradeId,
					rolesId: {$in: rolesId}
				},
				{
					relation: 'or',
					$or: [
						{
							gradesId: gradeId,
						},
						{
							rolesId: {$in: rolesId}
						}
					]
				}
			]
		};
		if(uid) {
			q.$or.push({
				fid: {$in: moderatorFid}
			});
		}
		const forums = await ForumModel.find(q).sort({order: 1});
		accessibleForums = accessibleForums.concat(forums);
		await Promise.all(forums.map(async forum => {
			await findForums(forum.fid);
		}));
	};
	fid = fid || '';
	await findForums(fid);
	return accessibleForums;
};
// ------------------------------------------------------------------------------


// ----------------------------- 加载能访问的板块fid ------------------------------
forumSchema.statics.accessibleFid = async (options) => {
	const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.accessibleForums(options);
	return forums.map(forum => forum.fid);
};
// ------------------------------------------------------------------------------


// ----------------------------- 加载能管理的板块fid ---------------------------------
forumSchema.statics.canManagerFid = async function(options) {
	const {uid, fid} = options;
	const ForumModel = mongoose.model('forums');
	const fidArr = [];
	const q = {
		accessible: true,
		moderators: uid||''
	};
	if(0) {
		q.parentId = fid;
	}
	const forums = await ForumModel.find(q);
	await Promise.all(forums.map(async forum => {
		if(!fidArr.includes(forum.fid)) fidArr.push(forum.fid);
		const childrenForums = await ForumModel.getAllChildrenForums(forum.fid);
		for(const forum of childrenForums) {
			if(forum.accessible && !fidArr.includes(forum.fid)) fidArr.push(forum.fid);
		}
	}));
	return fidArr;
};
// ------------------------------------------------------------------------------


// ----------------------------- 加载能管理的板块 ---------------------------------
forumSchema.statics.canManagerForums = async function(options) {
	const {uid, fid} = options;
	const ForumModel = mongoose.model('forums');
	const fidArr = [];
	const results = [];
	const q = {
		accessible: true,
		moderators: uid||''
	};
	if(0) {
		q.parentId = fid;
	}
	const forums = await ForumModel.find(q);
	await Promise.all(forums.map(async forum => {
		if(!fidArr.includes(forum.fid)) {
			fidArr.push(forum.fid);
			results.push(forum);
		}
		const childrenForums = await ForumModel.getAllChildrenForums(forum.fid);
		for(const forum of childrenForums) {
			if(forum.accessible && !fidArr.includes(forum.fid)) {
				fidArr.push(forum.fid);
				results.push(forum);
			}
		}
	}));
	return results;
};
// ------------------------------------------------------------------------------



// ----------------------------- 加载能看到入口的专业 ------------------------------
// 若forum.visibility = true, 则用户可在导航看到该专业的入口
forumSchema.statics.visibleForums = async (options) => {
	let {gradeId, rolesId, fid, uid} = options;
	const ForumModel = mongoose.model('forums');
	let visibleForums = [];
	let moderatorFid = [];
	if(uid) {
		moderatorFid = await ForumModel.canManagerFid({uid, fid});
	}
	const findForums = async (parentId) => {
		const q = {
			parentId,
			accessible: true,
			visibility: true,
			$or: [
				{
					isVisibleForNCC: true
				},
				{
					relation: 'and',
					gradesId: gradeId,
					rolesId:  {$in: rolesId}
				},
				{
					relation: 'or',
					$or: [
						{
							gradesId: gradeId
						},
						{
							rolesId: {$in: rolesId}
						}
					]
				}
			]
		};
		if(uid) {
			q.$or.push({
				fid: {$in: moderatorFid}
			})
		}
		const forums = await ForumModel.find(q).sort({order: 1});
		visibleForums = visibleForums.concat(forums);
		await Promise.all(forums.map(async forum => {
			await findForums(forum.fid);
		}));
	};
	fid = fid || '';
	await findForums(fid);
	return visibleForums;
};

// -----------------------------------------------------------------------------



// ----------------------------- 加载能看到入口的专业fid ----------------------------
// 若forum.visibility = true, 则用户可在导航看到该专业的入口
forumSchema.statics.visibleFid = async (options) => {
	const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.visibleForums(options);
	return forums.map(forum => forum.fid);
};
// -----------------------------------------------------------------------------



// ----------------------------- 访问专业权限判断 --------------------------------
// 判断该专业以及上层专业是否可以访问。
// 1. 专业是否处于开放状态（forum.accessible = true）
// 2. 是否是该专业的专家。
// 3. 用户等级是否满足条件。
// 4. 角色是否满足条件。
forumSchema.methods.ensurePermissionNew = async function(options) {
	this.ensureForumPermission(options);
	const forums = await this.getBreadcrumbForums();
	forums.map(forum => {
		forum.ensureForumPermission(options);
	})
};
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


// -------------------------------- 加载可以从中拿文章的专业 -----------------------
// 专业上的displayOnParent=true, 则该专业的文章可在上层专业显示
forumSchema.statics.forumsOfCanGetThreads = async (options) => {
	let {fid, gradeId, rolesId, uid} = options;
	const ForumModel = mongoose.model('forums');
	let resultForums = [];
	let moderatorFid = [];
	if(uid) {
		moderatorFid = await ForumModel.canManagerFid({uid, fid});
	}
	const findForums = async (parentId) => {
		const q = {
			parentId,
			accessible: true,
			displayOnParent: true,
			$or: [
				{
					relation: 'and',
					gradesId: gradeId,
					rolesId:  {$in: rolesId}
				},
				{
					relation: 'or',
					$or: [
						{
							gradesId: gradeId
						},
						{
							rolesId: {$in: rolesId}
						}
					]
				}
			]
		};
		if(uid) {
			q.$or.push({
				fid: {$in: moderatorFid}
			})
		}
		const forums = await ForumModel.find(q).sort({order: 1});
		resultForums = resultForums.concat(forums);
		await Promise.all(forums.map(async forum => {
			await findForums(forum.fid);
		}));
	};
	fid = fid || '';
	await findForums(fid);
	return resultForums;
};
// ------------------------------------------------------------------------------



// ------------------------------ 加载可以从中拿文章的专业fid -----------------------
// 专业上的displayOnParent=true, 则该专业的文章可在上层专业显示
forumSchema.statics.fidOfCanGetThreads = async (options) => {
	const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.forumsOfCanGetThreads(options);
	return forums.map(f => f.fid);
};
// -------------------------------------------------------------------------------

// ----------------------------- 验证是否为专家 ----------------------------
// 若用户是某个专业的专家，则该用户是该专业以及所有子专业的专家
forumSchema.methods.isModerator = async function(uid) {
	if(!uid) return false;
	let isModerator = false;
	const breadcrumbForums = await this.getBreadcrumbForums();
	breadcrumbForums.map(forum => {
		if(forum.moderators.includes(uid)) {
			isModerator = true;
		}
	});
	return isModerator;
};
// -----------------------------------------------------------------------

// 拿到某个专业的所有子专业，不验证权限
forumSchema.statics.getAllChildrenForums = async function(fid) {
	const ForumModel = mongoose.model('forums');
	let accessibleForum = [];
	const findForums = async (parentId) => {
		const forums = await ForumModel.find({parentId}).sort({order: 1});
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

module.exports = mongoose.model('forums', forumSchema);