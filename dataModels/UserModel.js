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
    unique: true,
    required: true,
    minlength: 1,
    maxlength: 30,
    trim: true
  },
  usernameLowerCase: {
    type: String,
    unique: true,
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

userSchema.methods.extendThreads = async function() {
  const ThreadModel = require('./ThreadModel');
  let threads = await ThreadModel.find({uid: this.uid, fid: {$ne: 'recycle'}}).sort({toc: -1}).limit(8);
  return this.threads = threads;
};

userSchema.methods.getUsersThreads = async function() {
  const ThreadModel = require('./ThreadModel');
  let threads = await ThreadModel.find({uid: this.uid, fid: {$ne: 'recycle'}, recycleMark: {"$nin":[true]}}).sort({toc: -1}).limit(8);
  threads = await Promise.all(threads.map(async t => {
    await t.extendForum();
    await t.extendFirstPost().then(p => p.extendUser());
    await t.extendLastPost().then(p => p.extendUser());
    return t;
  }));
  return threads;
};

userSchema.methods.extend = async function() {
  const UsersPersonalModel = require('./UsersPersonalModel');
  const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
  this.regPort = userPersonal.regPort;
  this.regIP = userPersonal.regIP;
  this.mobile = userPersonal.mobile;
  this.nationCode = userPersonal.nationCode;
  this.email = userPersonal.email;
};

userSchema.methods.extendRoles = async function() {
	const RoleModel = mongoose.model('roles');
	const roles = [];
	for(let cert of this.certs) {
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
		targetUid: uid,
		type: 'score',
		operationId: 'violation'
	});

	const updateObj = {
		threadCount,
		postCount,
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
	const scoreSettings = await SettingModel.findOnly({type: 'score'});
	const {coefficients} = scoreSettings;

	const {xsf, postCount, threadCount, disabledPostsCount, disabledThreadsCount, violationCount, dailyLoginCount, digestThreadsCount, recCount} = this;
	// 积分计算
	const scoreOfPostToThread = coefficients.postToThread*(postCount - disabledPostsCount);
	const scoreOfPostToForum = coefficients.postToForum*(threadCount - disabledThreadsCount);
	const scoreOfDigestThreadCount = coefficients.digest*digestThreadsCount;
	const scoreOfXsf = coefficients.xsf*xsf;
	const scoreOfDailyLogin = coefficients.dailyLogin*dailyLoginCount;
	const scoreOfViolation = coefficients.violation*violationCount;
	let scoreOfRecommend = 0;
	if(recCount !== 0) {
		scoreOfRecommend = Math.log10(recCount)/Math.log10(coefficients.thumbsUp);
	}
	const score = scoreOfDailyLogin + scoreOfDigestThreadCount + scoreOfPostToForum + scoreOfPostToThread + scoreOfXsf + scoreOfRecommend - scoreOfViolation;
	await this.update({score});
};


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
});


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

userSchema.statics.createUser = async (userObj) => {
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



module.exports = mongoose.model('users', userSchema);