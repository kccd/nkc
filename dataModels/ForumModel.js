const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const {getQueryObj} = require('../nkcModules/apiFunction');

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

/*// 验证是否有权限进入此版块
forumSchema.methods.ensurePermission = async function (ctx) {
	const {contentClasses} = ctx.data.certificates;
	return contentClasses.includes(this.class);

};*/
// 若是父板块则返回有权限访问的子版块的fid
forumSchema.methods.getFidOfChildForum = async function (ctx) {
  const ForumModel = require('./ForumModel');
  let fidArr = [];
  fidArr.push(this.fid);
  if(this.type === 'category') {
    let forums = await ForumModel.find({parentId: this.fid});
    await Promise.all(forums.map(async forum => {
      if(await forum.ensurePermission(ctx))
        fidArr.push(forum.fid);
    }));
  }
  return fidArr;
};

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


forumSchema.methods.getToppedThreads = async function(ctx) {
	// const ForumModel = mongoose.model('forums');
	const ThreadModel = mongoose.model('threads');
	/*const childrenFid = await ForumModel.getFidOfCanGetThreads(ctx, this.fid);
	childrenFid.push(this.fid);*/
	let match = {
		fid: this.fid,
		topped: true,
	}	// 过滤掉退回标记的帖子
	// match.recycleMark = {"$nin":[true]}
	// const threads = await ThreadModel.find(match).sort({tlm: -1});
	let threads1 = await ThreadModel.find(match).sort({tlm: -1});
	let threads = [];
	for(var i in threads1){
		if(threads1[i].uid !== ctx.data.user.uid && threads1[i].recycleMark === true){
			continue;
		}
		threads.push(threads1[i])
	}
	await Promise.all(threads.map(async thread => {
		await thread.extendForum();
		await thread.forum.extendParentForum();
		await thread.extendFirstPost().then(p => p.extendUser());
		await thread.extendLastPost().then(p => p.extendUser());
	}));
	return threads;
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

// 加载路径导航父板块
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


// 加载能看到入口的板块

forumSchema.statics.getVisibleForums = async (ctx, fid) => {
	const cc = ctx.data.certificates.contentClasses;
	const ForumModel = mongoose.model('forums');
	const visibleForums = [];
	const findForums = async (parentId) => {
		const accessForums = [];
		const forums = await ForumModel.find({parentId, accessible: true, visibility: true}).sort({order: 1});
		forums.map(forum => {
			if(cc.includes(forum.class) || forum.isVisibleForNCC) {
				visibleForums.push(forum);
				accessForums.push(forum);
			}
		});
		await Promise.all(accessForums.map(async forum => {
			await findForums(forum.fid);
		}));
	};
	fid = fid || '';
	await findForums(fid);
	return visibleForums;
};

// 加载能看到入口的fid
forumSchema.statics.getVisibleFid = async (ctx, fid) => {
	const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.getVisibleForums(ctx, fid);
	return forums.map(f => f.fid);
};

// 加载能访问的板块
forumSchema.statics.getAccessibleForums = async (ctx, fid) => {
	const cc = ctx.data.certificates.contentClasses;
	const ForumModel = mongoose.model('forums');
	let accessibleForum = [];
	const findForums = async (parentId) => {
		const forums = await ForumModel.find({parentId, accessible: true, class: {$in: cc}}).sort({order: 1});
		accessibleForum = accessibleForum.concat(forums);
		await Promise.all(forums.map(async forum => {
			await findForums(forum.fid);
		}));
	};
	fid = fid || '';
	await findForums(fid);
	return accessibleForum;
};
// 加载能访问板块的fid
forumSchema.statics.getAccessibleFid = async (ctx, fid) => {
	const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.getAccessibleForums(ctx, fid);
	return forums.map(f => f.fid);
};

// 加载可以从中拿文章的板块
forumSchema.statics.getForumsOfCanGetThreads = async (ctx, fid) => {
	const cc = ctx.data.certificates.contentClasses;
	const ForumModel = mongoose.model('forums');
	let accessibleForum = [];
	const findForums = async (parentId) => {
		const forums = await ForumModel.find({parentId, accessible: true, class: {$in: cc}, displayOnParent: true});
		accessibleForum = accessibleForum.concat(forums);
		await Promise.all(forums.map(async forum => {
			await findForums(forum.fid);
		}));
	};
	fid = fid || '';
	await findForums(fid);
	return accessibleForum;
};
// 加载可以从中拿文章的板块fid
forumSchema.statics.getFidOfCanGetThreads= async (ctx, fid) => {
	const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.getForumsOfCanGetThreads(ctx, fid);
	return forums.map(f => f.fid);
};

// 判断能否访问该板块
forumSchema.methods.ensurePermission = async function(ctx) {
	const ForumModel = mongoose.model('forums');
	const cc = ctx.data.certificates.contentClasses;
	if(!cc.includes(this.class) || !this.accessible) ctx.throw(403, '权限不足');
	const breadcrumbForums = await this.getBreadcrumbForums();
	// const accessibleFid = await ForumModel.getAccessibleFid(ctx);
	for(forum of breadcrumbForums) {
		// if(!accessibleFid.includes(forum.fid)) ctx.throw(403, '权限不足');
		if(!forum.accessible || !cc.includes(forum.class)) {
			ctx.throw('权限不足');
		}
	}
};

//加载帖子
forumSchema.methods.getThreadsByQuery = async function(ctx, query) {
	const ForumModel = mongoose.model('forums');
	const ThreadModel = mongoose.model('threads');
	const fidOfCanGetThreads = await ForumModel.getFidOfCanGetThreads(ctx, this.fid);
	fidOfCanGetThreads.push(this.fid);
	let {match, limit, sort, skip} = query;
	match.fid = {$in: fidOfCanGetThreads};
	// // 过滤掉退回标记的帖子
	// match.recycleMark = {"$nin":[true]}
	// const threads = await ThreadModel.find(match).sort(sort).skip(skip).limit(limit);
	let threads1 = await ThreadModel.find(match).sort(sort).skip(skip).limit(limit);
	let threads = [];
	if(ctx.data.userLevel === 0){
		for(var i in threads1){
			if(threads1[i].recycleMark === true){
				continue;
			}
			threads.push(threads1[i])
		}
	}else{
		for(var i in threads1){
			if(threads1[i].uid !== ctx.data.user.uid && threads1[i].recycleMark === true){
				continue;
			}
			threads.push(threads1[i])
		}
	}
	await Promise.all(threads.map(async thread => {
		await thread.extendFirstPost().then(p => p.extendUser());
		if(thread.lm) {
			await thread.extendLastPost().then(p => p.extendUser());
		} else {
			thread.lastPost = thread.firstPost;
		}
		await thread.extendForum();
		await thread.forum.extendParentForum();
		await thread.extendCategory();
	}));
	return threads;
};
//加载帖子数量
forumSchema.methods.getThreadsCountByQuery = async function(ctx, query) {
	const ForumModel = mongoose.model('forums');
	const ThreadModel = mongoose.model('threads');
	const fidOfCanGetThreads = await ForumModel.getFidOfCanGetThreads(ctx, this.fid);
	fidOfCanGetThreads.push(this.fid);
	const {match} = query;
	match.fid = {$in: fidOfCanGetThreads};
	return await ThreadModel.count(match);
};

forumSchema.statics.getAllChildrenForums = async function(fid) {
	const ForumModel = mongoose.model('forums');
	let accessibleForum = [];
	const findForums = async (parentId) => {
		const forums = await ForumModel.find({parentId});
		accessibleForum = accessibleForum.concat(forums);
		await Promise.all(forums.map(async forum => {
			await findForums(forum.fid);
		}));
	};
	fid = fid || '';
	await findForums(fid);
	return accessibleForum;
};

forumSchema.statics.getAllChildrenFid = async function(fid) {
	const ForumModel = mongoose.model('forums');
	const forums = await ForumModel.getAllChildrenForums(fid);
	return forums.map(f => f.fid);
};

module.exports = mongoose.model('forums', forumSchema);