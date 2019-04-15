const settings = require('../settings');
const {certificates} = settings.permission;
const mongoose = settings.database;
const Schema = mongoose.Schema;
const {indexUser, updateUser} = settings.elastic;

const userSchema = new Schema({
  kcb: {
    type: Number,
    default: 0
  },
  oldKcb: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  xsf: {
    type: Number,
    default: 0
  },
  tlv: {
    type: Date,
    default: Date.now,
  },
  disabledPostsCount: {
    type: Number,
    default: 0
  },
  disabledThreadsCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  threadCount: {
    type: Number,
    default: 0
  },
  recCount: {
    type: Number,
    default: 0
  },
  toppedThreadsCount: {
    type: Number,
    default: 0
  },
  digestThreadsCount: {
    type: Number,
    default: 0,
  },
	digestPostsCount: {
  	type: Number,
		default: 0
	},
	// 在线天数
	dailyLoginCount: {
  	type: Number,
		default: 0,
	},
	// 违规数
	violationCount: {
		type: Number,
		default: 0
	},
  score: {
    default: 0,
    type: Number
  },
  lastVisitSelf: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
	  index: 1,
	  default: '',
    // unique: true,
    // required: true,
    // minlength: 1,
    maxlength: 30,
    trim: true
  },
  usernameLowerCase: {
    type: String,
    // unique: true,
	  index: 1,
	  default: '',
    trim: true,
    lowercase: true
  },
  uid: {
    type: String,
    unique: true,
    required: true,
  },
  cart: [String],
  description: String,
  color: String,
  certs: {
    type: [String],
    index: 1
  },
  postSign: String,
	volumeA: {
  	type: Boolean,
		default: false
	},
	volumeB: {
  	type: Boolean,
		default: false
	},
	online: {
  	type: Boolean,
		default: false,
		index: 1
	},
  onlineType: {
    type: String,
    default: '',
    index: 1
  }
},
{toObject: {
  getters: true,
  virtuals: true
}});

userSchema.pre('save', function(next) {
  try {
  	this.usernameLowerCase = this.username;
	  const arr = ['default', 'scholar'];
  	const certs = [];
  	for(let cert of this.certs) {
  		if(!arr.includes(cert) && !certs.includes(cert)) {
				certs.push(cert);
		  }
	  }
	  this.certs = certs;
	  return next()
  } catch(e) {
    return next(e)
  }
});

userSchema.virtual('operations')
	.get(function() {
		return this._operations;
	})
	.set(function(operations) {
		this._operations = operations;
	});

userSchema.virtual('registerType')
	.get(function() {
		return this._registerType;
	})
	.set(function(registerType) {
		this._registerType = registerType;
	});

userSchema.virtual('sheetA')
	.get(function() {
		return this._sheetA;
	})
	.set(function(sheetA) {
		this._sheetA = sheetA;
	});

userSchema.virtual('sheetB')
	.get(function() {
		return this._sheetB;
	})
	.set(function(sheetB) {
		this._sheetB = sheetB;
	});


userSchema.virtual('regPort')
	.get(function() {
		return this._regPort;
	})
	.set(function(p) {
		this._regPort = p;
	});

userSchema.virtual('draftCount')
	.get(function() {
		return this._draftCount;
	})
	.set(function(draftCount) {
		this._draftCount = draftCount;
	});

userSchema.virtual('subscribeUsers')
	.get(function() {
		return this._subscribeUsers;
	})
	.set(function(subscribeUsers) {
		this._subscribeUsers = subscribeUsers;
	});

userSchema.virtual('regIP')
  .get(function() {
    return this._regIP;
  })
  .set(function(ip) {
    this._regIP = ip;
  });

userSchema.virtual('mobile')
	.get(function() {
		return this._mobile;
	})
	.set(function(m) {
		this._mobile = m;
	});

userSchema.virtual('nationCode')
	.get(function() {
		return this._nationCode;
	})
	.set(function(m) {
		this._nationCode = m;
	});

userSchema.virtual('email')
	.get(function() {
		return this._email;
	})
	.set(function(e) {
		this._email = e;
	});

userSchema.virtual('roles')
	.get(function() {
		return this._roles;
	})
	.set(function(e) {
		this._roles = e;
	});

userSchema.virtual('group')
  .get(function() {
    return this._group;
  })
  .set(function(g) {
    this._group = g;
  });

userSchema.virtual('threads')
  .get(function() {
    return this._threads;
  })
  .set(function(t) {
    this._threads = t;
  });

userSchema.virtual('generalSettings')
  .get(function() {
    return this._generalSettings;
  })
  .set(function(s) {
    this._generalSettings = s;
  });

userSchema.virtual('newMessage')
	.get(function() {
		return this._newMessage;
	})
	.set(function(newMessage) {
		this._newMessage = newMessage;
	});

userSchema.virtual('grade')
	.get(function() {
		return this._grade;
	})
	.set(function(grade) {
		this._grade = grade;
	});

userSchema.virtual('authLevel')
  .get(function() {
    return this._authLevel;
  })
  .set(function(authLevel) {
    this._authLevel = authLevel;
  });
userSchema.virtual('newVoteUp')
  .get(function() {
    return this._newVoteUp;
  })
  .set(function(newVoteUp) {
    this._newVoteUp = newVoteUp;
  });
userSchema.virtual('info') 
  .get(function() {
    return this._info;
  })
  .set(function(info) {
    this._info = info;
  });  

userSchema.methods.extendThreads = async function() {
  const ThreadModel = mongoose.model('threads');
  let threads = await ThreadModel.find({uid: this.uid, fid: {$ne: 'recycle'}}).sort({toc: -1}).limit(8);
  return this.threads = threads;
};

userSchema.methods.getUsersThreads = async function() {
  const ThreadModel = mongoose.model('threads');
  let threads = await ThreadModel.find({uid: this.uid, fid: {$ne: 'recycle'}, recycleMark: {"$nin":[true]}}).sort({toc: -1}).limit(8);
  return await ThreadModel.extendThreads(threads);
};

userSchema.methods.extend = async function(options) {
  const ExamsCategoryModel = mongoose.model('examsCategories');
  let proExamsCategoriesId, pubExamsCategoriesId;
  if(options) {
    proExamsCategoriesId = options.proExamsCategoriesId;
    pubExamsCategoriesId = options.pubExamsCategoriesId;
  } else {
    let categories = await ExamsCategoryModel.find({volume: 'B'}, {_id: 1});
    proExamsCategoriesId = categories.map(c => c._id);
    categories = await ExamsCategoryModel.find({volume: 'A'}, {_id: 1});
    pubExamsCategoriesId = categories.map(c => c._id);
  }
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const SecretBehaviorModel = mongoose.model('secretBehaviors');
  const ExamsPaperModel = mongoose.model('examsPapers');
  const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
  this.regPort = userPersonal.regPort;
  this.regIP = userPersonal.regIP;
  this.mobile = userPersonal.mobile;
  this.nationCode = userPersonal.nationCode;
  this.email = userPersonal.email;
  // 判断注册类型
  if(this.email) {
	  const behavior = await SecretBehaviorModel.findOne({uid: this.uid, operationId: 'bindEmail'});
	  if(behavior) {
		  this.registerType = 'mobile';
	  } else {
		  this.registerType = 'email';
	  }
  } else {
  	this.registerType = 'mobile';
  }
  // 获取b卷考试科目
  const paperB = await ExamsPaperModel.findOne({uid: this.uid, passed: true, cid: {$in: proExamsCategoriesId}}).sort({toc: 1});
  const paperA = await ExamsPaperModel.findOne({uid: this.uid, passed: true, cid: {$in: pubExamsCategoriesId}}).sort({toc: 1});

  if(paperB) {
    this.paperB = await ExamsCategoryModel.findOne({_id: paperB.cid});
  }
	if(paperA) {
    this.paperA = await ExamsCategoryModel.findOne({_id: paperA.cid});
  }
};

userSchema.methods.extendRoles = async function() {
  const RoleModel = mongoose.model('roles');
  let certs = [].concat(this.certs);
  if(!certs.includes('default')) {
    certs.push('default');
  }
  if(this.xsf > 0 && !certs.includes('scholar')) {
    certs.push('scholar');
  }
  if(certs.includes('banned')) {
    certs = ['banned'];
  }
  const roles = [];
	for(let cert of certs) {
		const role = await RoleModel.findOne({_id: cert});
		if(role) roles.push(role);
	}
	return this.roles = roles;
};


// 用户数据更新
userSchema.methods.updateUserMessage = async function() {
  const PostModel = mongoose.model('posts');
  const ThreadModel = mongoose.model('threads');
  const UsersScoreLogModel = mongoose.model('usersScoreLogs');

  const {uid} = this;
	// 发帖回帖统计
  const threads = await ThreadModel.find({uid}, {oc: 1, _id: 0});
  const threadsOc = threads.map(t => t.oc);
  const threadCount = threads.length;
  const disabledThreadsCount = await ThreadModel.count({uid, disabled: true});
  const digestThreadsCount = await ThreadModel.count({uid, digest: true});
  const toppedThreadsCount = await ThreadModel.count({uid, topped: true});
	const allDigestPostsCount = await PostModel.count({uid, digest: true});
	const digestPostsCount = allDigestPostsCount - digestThreadsCount;
  const postCount = await PostModel.count({pid: {$nin: threadsOc}, uid});
  const disabledPostsCount = await PostModel.count({pid: {$nin: threadsOc}, uid, disabled: true});
	// 日常登录统计
  const dailyLoginCount = await UsersScoreLogModel.count({
	  uid,
	  type: 'score',
	  operationId: 'dailyLogin'
  });
	// 被赞统计
	/*const recommendCount = await UsersScoreLogModel.count({
		targetUid: uid,
		type: 'score',
		operationId: 'recommendPost'
	});
	const unRecommendCount = await UsersScoreLogModel.count({
		targetUid: uid,
		type: 'score',
		operationId: 'UNRecommendPost'
	});
	const recCount = recommendCount - unRecommendCount;*/
	const results = await PostModel.aggregate([
		{
			$match: {
				uid,
				disabled: false,
				'recUsers.0': {$exists: 1}
			}
		},
		{
			$unwind: '$recUsers'
		},
		{
			$count: 'recCount'
		}
	]);
	let recCount = 0;
	if(results.length !== 0) {
		recCount = results[0].recCount;
	}
	// 违规统计
	const violationCount = await UsersScoreLogModel.count({
		uid,
		type: 'score',
		operationId: 'violation'
	});

	const updateObj = {
		threadCount,
		postCount,
		digestPostsCount,
		disabledPostsCount,
		disabledThreadsCount,
		digestThreadsCount,
		toppedThreadsCount,
		recCount,
		dailyLoginCount,
		violationCount
	};

  await this.update(updateObj);
  for(const key in updateObj) {
  	if(!updateObj.hasOwnProperty(key)) continue;
  	this[key] = updateObj[key];
  }
  await this.calculateScore();
};

// 积分计算
userSchema.methods.calculateScore = async function() {
	const SettingModel = mongoose.model('settings');
	// 积分设置
	const scoreSettings = await SettingModel.findOnly({_id: 'score'});
	const {coefficients} = scoreSettings.c;

	const {xsf, postCount, threadCount, disabledPostsCount, disabledThreadsCount, violationCount, dailyLoginCount, digestThreadsCount, digestPostsCount, recCount} = this;
	// 积分计算
	const scoreOfPostToThread = coefficients.postToThread*(postCount - disabledPostsCount);
	const scoreOfPostToForum = coefficients.postToForum*(threadCount - disabledThreadsCount);
	const scoreOfDigestThreadCount = coefficients.digest*digestThreadsCount;
	const scoreOfDigestPostCount = coefficients.digestPost*digestPostsCount;
	const scoreOfXsf = coefficients.xsf*xsf;
	const scoreOfDailyLogin = coefficients.dailyLogin*dailyLoginCount;
	const scoreOfViolation = coefficients.violation*violationCount;
	let scoreOfRecommend = 0;
	if(recCount >= 0) {
		scoreOfRecommend = coefficients.thumbsUp*Math.sqrt(recCount);
	}
	const score = scoreOfDailyLogin + scoreOfDigestThreadCount + scoreOfDigestPostCount + scoreOfPostToForum + scoreOfPostToThread + scoreOfXsf + scoreOfRecommend + scoreOfViolation;
	await this.update({score});
};

/* 
旧的获取证书名称的方法
userSchema.virtual('navbarDesc').get(function() {
  const {certs, username, xsf = 0, kcb = 0} = this;
  let cs = [];
  if(!certs.includes('default')) {
  	certs.unshift('default');
  }
  if(xsf > 0 && !certs.includes('scholar')) {
  	certs.push('scholar');
  }
  for(const cert of certs) {
  	if(cert && certificates[cert] && certificates[cert].displayName)
      cs.push(certificates[cert].displayName);
  }
  cs = cs.join(' ');
  if(certs.includes('banned')){
    cs = '开除学籍';
  }
  return {
    username: username,
    xsf: xsf,
    kcb: kcb,
    cs: cs
  }
}); */


userSchema.pre('save', async function(next) {
  // handle the ElasticSearch index
  try {
    const {_initial_state_: initialState} = this;
    if (!initialState) { //this is a new user
      await indexUser(this);
      return next()
    } else if (initialState.description !== this.description || initialState.username !== this.username) {
      // description has changed , update it in the es
      await updateUser(this);
      return next()
    } else {
      return next()
    }
  } catch(e) {
    return next(e)
  }
});


// 创建用户（新）
userSchema.statics.createUser = async (option) => {
	const UserModel = mongoose.model('users');
	const UsersPersonalModel = mongoose.model('usersPersonal');
	const UsersSubscribeModel = mongoose.model('usersSubscribe');
	const PersonalForumModel = mongoose.model('personalForums');
	const SettingModel = mongoose.model('settings');
	const UsersGeneraModel = mongoose.model('usersGeneral');
	const MessageModel = mongoose.model('messages');
	const SmsModel = mongoose.model('sms');
	const SystemInfoLogModel = mongoose.model('systemInfoLogs');

	const userObj = Object.assign({}, option);

	const toc = Date.now();

	const uid = await SettingModel.operateSystemID('users', 1);
	userObj.uid = uid;
	userObj.toc = toc;
	userObj.tlv = toc;
	userObj.tlm = toc;
	userObj.moderators = [uid];
	userObj.certs = [];

	if(userObj.mobile) userObj.certs.push('mobile');

	userObj.newMessage = {
		messages: 0,
		at: 0,
		replies: 0,
		system: 0
	};

	const systemInfo = await MessageModel.find({ty: 'STE'}, {_id: 1});
	await Promise.all(systemInfo.map( async s => {
		const log = SystemInfoLogModel({
			mid: s._id,
			uid
		});
		await log.save();
	}));

	userObj.abbr = `用户${uid}`;
	userObj.displayName = userObj.abbr + '的专栏';
	userObj.descriptionOfForum = userObj.abbr + '的专栏';

	const user = UserModel(userObj);
	const userPersonal = UsersPersonalModel(userObj);
	const userSubscribe = UsersSubscribeModel(userObj);
	const personalForum = PersonalForumModel(userObj);
	const userGeneral = UsersGeneraModel({uid});

	try {
		await user.save();
		await userPersonal.save();
		await userSubscribe.save();
		await personalForum.save();
		await userGeneral.save();
		const allSystemMessages = await SmsModel.find({fromSystem: true});
		for(let sms of allSystemMessages) {
			const viewedUsers = sms.viewedUsers;
			viewedUsers.push(uid);
			await sms.update({viewedUsers});
		}
	} catch (error) {
		await UserModel.remove({uid});
		await UsersPersonalModel.remove({uid});
		await UsersSubscribeModel.remove({uid});
		await PersonalForumModel.remove({uid});
		await UsersGeneraModel.remove({uid});
		await SystemInfoLogModel.remove({uid});
		const err = new Error(`新建用户出错: ${error}`);
		err.status = 500;
		throw err;
	}
	return user;
};

// 创建用户（旧）
userSchema.statics.createUserOld = async (userObj) => {
	const SettingModel = mongoose.model('settings');
	const toc = Date.now();
	const uid = await SettingModel.operateSystemID('users', 1);
	userObj.uid = uid;
	userObj.toc = toc;
	userObj.tlv = toc;
	userObj.tlm = toc;
	userObj.moderators = [uid];
	userObj.certs = [];
	if(userObj.mobile) userObj.certs.push('mobile');
	if(userObj.email) userObj.certs.push('email');
	if(typeof(userObj.password) === 'string') {
		const {newPasswordObject} = require('../nkcModules/apiFunction');
		const passwordObj = newPasswordObject(userObj.password);
		userObj.password = passwordObj.password;
		userObj.hashType = passwordObj.hashType;
	}
	userObj.newMessage = {
		messages: 0,
		at: 0,
		replies: 0,
		system: 0
	};
	userObj.abbr = userObj.username.slice(0,6);
	userObj.displayName = userObj.username + '的专栏';
	userObj.descriptionOfForum = userObj.username + '的专栏';
	const UserModel = mongoose.model('users');
	const UsersPersonalModel = mongoose.model('usersPersonal');
	const UsersSubscribeModel = mongoose.model('usersSubscribe');
	const PersonalForumModel = mongoose.model('personalForums');
	const SmsModel = mongoose.model('sms');
	const user = UserModel(userObj);
	const userPersonal = UsersPersonalModel(userObj);
	const userSubscribe = UsersSubscribeModel(userObj);
	const personalForum = PersonalForumModel(userObj);
	try {
		await user.save();
		await userPersonal.save();
		await userSubscribe.save();
		await personalForum.save();
		const allSystemMessages = await SmsModel.find({fromSystem: true});
		for(let sms of allSystemMessages) {
			const viewedUsers = sms.viewedUsers;
			viewedUsers.push(uid);
			await sms.update({viewedUsers});
		}
	} catch (error) {
		await UserModel.remove({uid});
		await UsersPersonalModel.remove({uid});
		await UsersSubscribeModel.remove({uid});
		await PersonalForumModel.remove({uid});
		const err = new Error(`新建用户出错: ${error}`);
		err.status = 500;
		throw err;
	}
	return user;
};

userSchema.methods.extendGrade = async function() {
	const UsersGradeModel = mongoose.model('usersGrades');
	if(!this.score || this.score < 0) {
		this.score = 0
	}
	const grade = await UsersGradeModel.findOne({score: {$lte: this.score}}).sort({score: -1});
	return this.grade = grade;
};
/* 
  拓展全局设置
  @author pengxiguaa 2019/3/6
*/
userSchema.methods.extendGeneralSettings = async function() {
  return this.generalSettings = await mongoose.model('usersGeneral').findOnly({uid: this.uid});
}
/* 
  验证用户是否完善资料，包括：用户名、密码
  未完善则会抛出错误
  @author pengxiguaa 2019/3/7
*/
userSchema.methods.ensureUserInfo = async function() {
  if(!this.username) throwErr(403, '您的账号还未完善资料，请前往资料设置页完善必要资料。');
}

userSchema.methods.getNewMessagesCount = async function() {
	const MessageModel = mongoose.model('messages');
	const SystemInfoLogModel = mongoose.model('systemInfoLogs');
	// 系统通知
  const allSystemInfoCount = await MessageModel.count({ty: 'STE'});
  const viewedSystemInfoCount = await SystemInfoLogModel.count({uid: this.uid});
  const newSystemInfoCount = allSystemInfoCount - viewedSystemInfoCount;
	// 系统提醒
  const newReminderCount = await MessageModel.count({ty: 'STU', r: this.uid, vd: false});
	// 用户信息
  const newUsersMessagesCount = await MessageModel.count({ty: 'UTU', s: {$ne: this.uid}, r: this.uid, vd: false});
	return {
		newSystemInfoCount,
		newReminderCount,
		newUsersMessagesCount
	}
};

userSchema.methods.getMessageLimit = async function() {
	const grade = await this.extendGrade();
	const roles = await this.extendRoles();
	let {messagePersonCountLimit, messageCountLimit} = grade;
	for(const role of roles) {
		const personLimit = role.messagePersonCountLimit;
		const messageLimit = role.messageCountLimit;
		if(personLimit > messagePersonCountLimit) {
			messagePersonCountLimit = personLimit;
		}
		if(messageLimit > messageCountLimit) {
			messageCountLimit = messageLimit;
		}
	}
	return {
		messagePersonCountLimit,
		messageCountLimit
	}
};
/* 
  获取用户发表文章、发表回复的时间和次数限制
  @author pengxiguaa 2019/2/27
*/
userSchema.methods.getPostLimit = async function() {

	const grade = await this.extendGrade();
	const roles = await this.extendRoles();

	const arr = [grade].concat(roles);

	let postToForumCountLimit = 0, postToForumTimeLimit = 9999999999,
    postToThreadCountLimit = 0, postToThreadTimeLimit = 9999999999;

	for(const item of arr) {
	  // 读取"发表文章次数"最大值。
	  if(item.postToForum.countLimit.unlimited) {
      postToForumCountLimit = 9999999999;
    } else if(postToForumCountLimit < item.postToForum.countLimit.num) {
      postToForumCountLimit = item.postToForum.countLimit.num;
    }
    // 读取"发表回复次数"最大值。
    if(item.postToThread.countLimit.unlimited) {
      postToThreadCountLimit = 9999999999;
    } else if(postToThreadCountLimit < item.postToThread.countLimit.num) {
      postToThreadCountLimit = item.postToThread.countLimit.num;
    }
    // 读取"发表文章间隔时间"最小值。
    if(item.postToForum.timeLimit.unlimited) {
      postToForumTimeLimit = 0;
    } else if(postToForumTimeLimit > item.postToForum.timeLimit.num) {
      postToForumTimeLimit = item.postToForum.timeLimit.num;
    }
    // 读取"发表回复间隔时间"最小值。
    if(item.postToThread.timeLimit.unlimited) {
      postToThreadTimeLimit = 0;
    } else if(postToThreadTimeLimit > item.postToThread.timeLimit.num) {
      postToThreadTimeLimit = item.postToThread.timeLimit.num;
    }
  }

	return {
		postToForumTimeLimit,
		postToForumCountLimit,
		postToThreadCountLimit,
		postToThreadTimeLimit
	}

};

/* 
  拓展用户基本信息，显示在用户面板中，任何人可见的内容
  @param users: 用户对象数组
  @author pengxiguaa 2019/2/27
*/
userSchema.statics.extendUsersInfo = async (users) => {
  const RoleModel = mongoose.model('roles');
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const uid = new Set(), personalObj = {};
  for(const user of users) {
    uid.add(user.uid);
  }
  const usersPersonal = await UsersPersonalModel.find({uid: {$in: [...uid]}}, {uid: 1, mobile: 1, nationCode: 1, email: 1});
  for(const personal of usersPersonal) {
    personalObj[personal.uid] = personal;
  }
  await Promise.all(users.map(async user => {
    let certs = user.certs.concat([]);
    // 若用户拥有“banned”证书，则忽略其他证书
    if(certs.includes('banned')) {
      certs = ['banned'];
    } else {
      if(!certs.includes('default')) {
        certs.unshift('default');
      }
      // 若用户的学术分大于0，则临时添加“scholar”证书
      if(!certs.includes('scholar') && user.xsf > 0){
        certs.push('scholar');
      }
    }
    const info = {};
    info.certsName = [];
    for(const cert of certs) {
      const role = await RoleModel.extendRole(cert);
      if(role.displayName) {
        info.certsName.push(role.displayName);
      }
    }
    if(!certs.includes('banned')) {
      const userPersonal = personalObj[user.uid];
      // 若用户绑定了手机号，则临时添加“机友”标志
      if(userPersonal.mobile && userPersonal.nationCode) info.certsName.push('机友');
      // 若用户绑定了邮箱，则临时添加“笔友”标志
      if(userPersonal.email) info.certsName.push('笔友');
    }
    info.certsName = info.certsName.join(' ');
    user.info = info;
  }));
};

userSchema.methods.extendAuthLevel = async function() {
  const userPersonal = await mongoose.model('usersPersonal').findUsersPersonalById(this.uid);
  return this.authLevel = await userPersonal.getAuthLevel();
};

/* 
  通过uid查找单一用户
  @param uid: 用户ID
  @author pengxiguaa 2019/3/7 
*/
userSchema.statics.findById = async (uid) => {
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOne({uid});
  if(!user) throwErr(404, `未找到ID为【${uid}】的用户`);
  return user;
};

/*
* 根据用户的kcb转账记录 计算用户的科创币总量 并将计算结果写到user.kcb
* @param {String} uid 用户ID
* @author pengxiguaa 2019-4-4
* */
userSchema.statics.updateUserKcb= async (uid) => {
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const fromRecords = await KcbsRecordModel.aggregate([
    {
      $match: {
        from: uid,
        verify: true
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$num"
        }
      }
    }
  ]);
  const toRecords = await KcbsRecordModel.aggregate([
    {
      $match: {
        to: uid,
        verify: true
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$num"
        }
      }
    }
  ]);
  const expenses = fromRecords.length? fromRecords[0].total: 0;
  const income = toRecords.length? toRecords[0].total: 0;
  const total = income - expenses;
  if(uid === "bank") {
    await SettingModel.update({_id: "kcb"}, {
      $set: {
        "c.totalMoney": total
      }
    });
  } else {
    await UserModel.update({
      uid
    }, {
      $set: {
        kcb: total
      }
    });
  }
  return total;
};
/*
* 更新用户的kcb
* 该方法位于user对象
* @author pengxiguaa 2019-4-15
* */
userSchema.methods.updateKcb = async function() {
  const UserModel = mongoose.model("users");
  this.kcb = await UserModel.updateUserKcb(this.uid);
};
module.exports = mongoose.model('users', userSchema);
