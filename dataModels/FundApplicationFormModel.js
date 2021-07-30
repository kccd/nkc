const settings = require('../settings');
const moment = require('moment');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationFormSchema = new Schema({
  _id: Number,
	// 申请年份 用于生成申请表的代号
	year: {
  	type: String,
		default: null,
		index: 1
	},
	order: {
  	type: Number,
		default: null,
		index: 1
	},
	code: {// 申请编号 如：2017A02
		type: String,
		default: ''
	},
	// 基金项目ID
  fundId: {
    type: String,
    required: true,
    index: 1
  },
	// 是否未固定金额
	fixedMoney: {
  	type: Boolean,
		required: true
	},
	// 申请时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
	// 提交时间
	timeToSubmit: {
  	type: Date,
		default: null
	},
	// 通过审核的时间
	timeToPassed: {
		type: Date,
		default: null
	},
	// 完成的时间
	timeOfCompleted: {
  	type: Date,
		default: null
	},
	// 最后修改时间
  tlm: {
    type: Date,
    index: 1
  },
	// 来自个人或团队 personal、team
	from: {
  	type: String,
		required: true
	},
  publicity: { // 示众
    timeOfBegin: {
      type: Date,
      default: null,
      index: 1
    },
    timeOfOver: {
      type: Date,
      default: null,
      index: 1
    }
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 申请者输入的预算 不一定是最终打款的金额
  budgetMoney: { // 预算
    type: Schema.Types.Mixed,
    default: []
    /*
    {
      purpose: String, // 物品名称
      money: Number,   // 单价
      count: Number,   // 数量
			suggest: Number, // 专家建议
			fact: Number     // 管理员最后批准
    }
    */
  },
  // 结题时填写的各个物品的实际花费
	actualMoney: {
  	type: [Schema.Types.mixed],
		default: null,
    /*{
      purpose: String, // 物品名称
      money: Number,   // 单价
      count: Number,   // 数量
    }*/
	},

  // 若基金项目为固定金额，则此字段为fund.money.value
  // 若基金项目为非固定金额，根据实际批准的预算统计得到
  money: {
    type: Number,
    default: 0
  },


  projectCycle: { // 预计周期
	  type: Number,
	  default: null,
	  index: 1,
	  min: [1, '预计周期不能小于1']
  },
  threadsId: {
  	applying: {// 申请时附带的帖子
		  type: [String],
		  default:[]
	  },
	  completed: { // 结项时附带的帖子
		  type: [String],
		  default:[]
	  }
  },
  papersId: {
	  applying: {
		  type: [String],
		  default:[]
	  },
	  completed: {
		  type: [String],
		  default:[]
	  }
  },
  account: {
    paymentType: {
      type: String,
      default: null
    },
    number: {
      type: String,
      default: null,
	    maxlength: [30, '收款账号位数超过限制']
    },
	  name: {
    	type: String,
		  default: null,
		  maxlength: [10, '户名字数超过限制']
	  },
	  bankName: {
    	type: String,
		  default: null,
		  maxlength: [10, '银行全称字数超过限制']
	  }
  },
  projectId: {
    type: Number,
	  default: null,
	  index: 1
  },
  status: {
	  submitted: { // 判断是否是提交过的申请表，下边的lock.submitted作用是判断申请表当前是否提交。
			type: Boolean,
		  default: null
	  },
    usersSupport: { // 获得网友支持
      type: Boolean,
      default: null,
      index: 1
    },
    projectPassed: { // 专家审核通过
      type:Boolean,
      default: null,
      index: 1
    },
    adminSupport: { // 管理员同意
      type: Boolean,
      default: null,
      index: 1
    },
    remittance: { // 已拨款
      type: Boolean,
      default: null,
      index: 1
    },
    completed: { // 项目已完成
      type: Boolean,
      default: null,
      index: 1
    },
    successful: { // 项目研究是否成功
      type: Boolean,
      default: null,
      index: 1
    },
    excellent: { // 优秀项目
      type: Boolean,
      default: null,
      index: 1
    }
  },
	useless: { //giveUp: 放弃申请，exceededModifyCount: 超过修改次数， null: 数据有效， refuse：永久拒绝
  	type: String,
		default: null,
		index: 1
	},
	disabled: {
  	type: Boolean,
		default: false,
		index: 1
	},
	submittedReport: {
		type: Boolean,
		default: false,
		index: 1
	},
	completedAudit: {
		type: Boolean,
		default: false,
		index: 1
	},
	reportNeedThreads: {
		type: Boolean,
		default: false
	},
	category: {
		type: String,
		default: ""
	},
  tid: {
    type: String,
    default: "",
    index: 1
  },
  lock: {
  	submitted: { // 用于判断用户当前申请表是否已提交
  		type: Boolean,
		  default: false
	  },
    auditing: {
      type: Boolean,
      default: false,
    },
    uid: {
      type: String,
      default: null,
    },
    timeToOpen: {
      type: Date,
      default: Date.now
    },
    timeToClose: {
      type: Date,
      default: Date.now
    }
  },
	modifyCount: {// 已经修改的次数
  	type: Number,
		default: 0
	},
  supportersId: {// 支持的人
    type: [String],
    default: [],
    index: 1
  },
  objectorsId: { // 反对的人
    type: [String],
    default: [],
    index: 1
  },
	remittance: {
  	/*
  	* status: null, true, false
  	* money: number
  	* article: id 阶段性报告
  	* */
  	type: [Schema.Types.Mixed],
		default: []
	}
}, {
  collection: 'fundApplicationForms',
	toObject: {
		getters: true,
		virtuals: true
	}
});

fundApplicationFormSchema.virtual('user')
	.get(function() {
		return this._user;
	})
	.set(function(user) {
		this._user = user
	});


fundApplicationFormSchema.virtual('fund')
	.get(function() {
		return this._fund;
	})
	.set(function(fund) {
		this._fund = fund;
	});

fundApplicationFormSchema.virtual('members')
	.get(function() {
		return this._members;
	})
	.set(function(members) {
		this._members = members;
	});

fundApplicationFormSchema.virtual('applicant')
	.get(function() {
		return this._applicant;
	})
	.set(function(applicant) {
		this._applicant = applicant;
	});

fundApplicationFormSchema.virtual('project')
	.get(function() {
		return this._project;
	})
	.set(function(project) {
		this._project = project;
	});

fundApplicationFormSchema.virtual('threads')
	.get(function() {
		return this._threads;
	})
	.set(function(threads) {
		this._threads = threads;
	});

fundApplicationFormSchema.virtual('comments')
	.get(function() {
		return this._comments;
	})
	.set(function(comments) {
		this._comments = comments;
	});

fundApplicationFormSchema.virtual('forum')
	.get(function() {
		return this._forum;
	})
	.set(function(forum) {
		this._forum = forum;
	});

fundApplicationFormSchema.virtual('supporters')
	.get(function() {
		return this._supporters;
	})
	.set(function(supporters) {
		this._supporters = supporters;
	});

fundApplicationFormSchema.virtual('objectors')
	.get(function() {
		return this._objectors;
	})
	.set(function(objectors) {
		this._objectors = objectors;
	});

fundApplicationFormSchema.virtual('reportThreads')
	.get(function() {
		return this._reportThreads;
	})
	.set(function(reportThreads) {
		this._reportThreads = reportThreads;
	});


fundApplicationFormSchema.pre('save', function(next) {
  this.tlm = Date.now();
  next();
});

fundApplicationFormSchema.pre('save', async function(next) {
	const FundApplicationFormModel = mongoose.model('fundApplicationForms');
	const fund = await this.extendFund();
	const {code, status, supportersId} = this;
	const {submitted} = status;

	/*// 网友支持功能暂时屏蔽，所有申请默认通过
  status.usersSupport = true;*/


	// 生成申请表编号
	if(submitted && !code) {
		const moment = require('moment');
		const year = moment().format('YYYY');
		const a = await FundApplicationFormModel.findOne({fundId: fund._id, year}).sort({order: -1});
		let code, order;
		if(a) {
			order = a.order + 1;
			code = year + fund._id + order;
		} else {
			order = 1;
			code = year + fund._id + 1;
		}
		this.year = year;
		this.code = code;
		this.order = order;
	}
	await next();
});


fundApplicationFormSchema.methods.extendApplicant = async function(options={}) {
	const {extendSecretInfo = true} = options;
	const FundApplicationUserModel = require('./FundApplicationUserModel');
	const applicant= await FundApplicationUserModel.findOne({applicationFormId: this._id, uid: this.uid});
	if(applicant) {
		await applicant.extendUser();
		if(!extendSecretInfo) {
			applicant.mobile = null;
			applicant.idCardNumber = null;
		}
	}
	return this.applicant = applicant;
};

fundApplicationFormSchema.methods.extendMembers = async function() {
	const FundApplicationUserModel = require('./FundApplicationUserModel');
	const applicationUsers = await FundApplicationUserModel.find({applicationFormId: this._id, uid: {$ne: this.uid}, removed: false}).sort({toc: 1});

	return this.members = await Promise.all(applicationUsers.map(async aUser => {
		await aUser.extendUser();
		return aUser.toObject();
	}));
};

fundApplicationFormSchema.methods.extendForum = async function() {
	let forum;
	if(this.category) {
		const ForumModel = require('./ForumModel');
		forum = await ForumModel.findOne({fid: this.category});
	}
	return this.forum = forum;
};

fundApplicationFormSchema.methods.extendFund = async function() {
	const FundModel = require('./FundModel');
	const fund = await FundModel.findOne({_id: this.fundId, disabled: false});
	// if(!fund) throw '抱歉！该基金项目已被屏蔽，所有基金申请表暂不能查看。';
	return this.fund = fund;
};

fundApplicationFormSchema.methods.extendProject = async function() {
	const FundDocumentModel = require('./FundDocumentModel');
	if(this.projectId === null) return null;
	const project = await FundDocumentModel.findOne({_id: this.projectId});
	return this.project = project;
};

fundApplicationFormSchema.methods.extendThreads = async function() {
	const ThreadModel = require('./ThreadModel');
	const {threadsId} = this;
	const threads = {};
	threads.applying = await Promise.all(threadsId.applying.map(async tid => {
		const thread = await ThreadModel.findOnly({tid});
		const firstPost = await thread.extendFirstPost();
		if(firstPost.anonymous) {
		  thread.uid = "";
		  firstPost.uid = "";
		  firstPost.uidlm = "";
    } else {
		  await firstPost.extendUser();
    }
		return thread;
	}));
	threads.completed = await Promise.all(threadsId.completed.map(async tid => {
		const thread = await ThreadModel.findOnly({tid});
		const firstPost = await thread.extendFirstPost();
		if(firstPost.anonymous) {
		  thread.uid = "";
		  firstPost.uid = "";
		  firstPost.uidlm = "";
    } else {
		  await firstPost.extendUser();
    }
		return thread;
	}));
	return this.threads = threads;
};

fundApplicationFormSchema.methods.extendSupporters = async function() {
	const UserModel = require('./UserModel');
	const supporters = [];
	for(let uid of this.supportersId) {
		const user = await UserModel.findOnly({uid});
		supporters.push(user);
	}
	return this.supporters = supporters;
};

fundApplicationFormSchema.methods.extendObjectors = async function() {
	const UserModel = require('./UserModel');
	const objectors = [];
	for(let uid of this.objectorsId) {
		const user = await UserModel.findOnly({uid});
		objectors.push(user);
	}
	return this.objectors = objectors;
};

fundApplicationFormSchema.methods.extendReportThreads = async function() {
	const ThreadModel = require('./ThreadModel');
	const threadsId = [];
	for(let r of this.remittance) {
		if(r.threads && r.threads.length !== 0) {
			for(tid of r.threads) {
				if(!threadsId.includes(tid)) {
					threadsId.push(tid)
				}
			}
		}
	}
	if(this.status.completed && this.threadsId.completed.length !== 0) {
		for(let tid of this.threadsId.completed) {
			if(!threadsId.includes(tid)) {
				threadsId.push(tid);
			}
		}
	}
	const reportThreads = await Promise.all(threadsId.map(async tid => {
		const thread = await ThreadModel.findOnly({tid});
		const firstPost = await thread.extendFirstPost();
		if(firstPost.anonymous) {
		  thread.uid = "";
		  firstPost.uid = "";
		  firstPost.uidlm = "";
    } else {
		  await firstPost.extendUser();
    }
		return thread;
	}));
	return this.reportThreads = reportThreads;
};

fundApplicationFormSchema.methods.ensureInformation = async function() {
	const PhotoModel = require('./PhotoModel');
	const ForumModel = mongoose.model("forums");
	const elasticSearch = require("../nkcModules/elasticSearch");
	const ThreadModel = mongoose.model("threads");
	const PostModel = mongoose.model("posts");
	const FundDocumentModel = require('./FundDocumentModel');
	const FundApplicationUserModel = mongoose.model("fundApplicationUsers");
	const FundApplicationFormHistoryModel = require('./FundApplicationHistoryModel');
	const FundApplicationForm = mongoose.model('fundApplicationForms');
	await this.extendProject();
	const {
		fixedMoney,
		from,
		members,
		applicant,
		fund,
		budgetMoney,
		projectCycle,
		threadsId,
		threads,
		account,
		projectId,
		project,
		status,
		useless,
		lock,
		modifyCount,
		supporter,
		objector,
		category,
		disabled,
    supportersId
	} = this;
	const {
		money,
		thread,
		applicationMethod,
		detailedProject
	} = fund;

	// 判断申请表有效性
	if(disabled) {
		throw '申请表已被屏蔽。';
	}
	switch (useless) {
		case 'giveUp':
			throw '申请表已被放弃。';
		case 'exceededModifyCount':
			throw '申请表已超过最大修改次数。';
	}
	// 申请人信息判断
	if(!applicant.lifePhotosId || applicant.lifePhotosId.length === 0) {
		throw '请至少添加一张生活照！';
	}
	if(!applicant.name) throw '请填写您的真实姓名！';
	if(!applicant.idCardNumber) throw '请填写您的身份证号码！';
	if(!applicant.mobile) throw '请填写您的联系电话！';
	if(!account.paymentType) throw '请选择收款方式！';
	if(!account.number) throw '请填写您的收款账号！';
	if(!applicant.description) throw '请填写您的自我介绍！';
	if(fund.auditType === 'system' && account.paymentType !== 'alipay') throw '系统审核只支持支付宝收款。';
	// 项目信息判断
	if(!projectId) {
		throw '请填写项目信息！';
	} else {
		if(!project.t) throw '请填写项目名称！';
		if(!project.c) throw '请输入项目名称！';
		if(!project.abstractCn && detailedProject) throw '请输入项目摘要！';
	}

	//其他信息判断
	if (projectCycle === null) throw '请填写研究周期！';
	if (!category) throw '请选择学科分类。';
	if(money.max === null) { // 定额基金
		if(!budgetMoney) throw '请输入资金用途！';
	} else { //不定额基金
		if(!budgetMoney || budgetMoney.length === 0) {
			throw '请输入资金用途！';
		} else {
			let aggregate = 0;
			if(typeof budgetMoney === 'string') throw '请输入资金用途！';
			for(let b of budgetMoney) {
				aggregate += (b.count*b.money);
			}
			if(aggregate === 0) throw '资金预算不能为0！';
			if(aggregate > money.max) throw '资金预算金额已超过该基金项目单笔申请的最大金额！';
		}
	}
	if(thread.count > threadsId.applying.length) throw `附带的文章数未达到最低要求(至少${thread.count}篇)`;
	// 如果是个人申请，则删除所有组员已存到基金（type='fund'）的生活照，并标记所有组员为已删除
	if(from === 'personal') {
		if(!applicationMethod.personal) throw '该基金不允许个人申请！';
		for(let u of members) {
			const {lifePhotosId} = u;
			for(let _id of lifePhotosId) {
				const photo = await PhotoModel.findOnly({_id});
				if(photo.type === 'fund') await photo.deleteOne();
			}
			await u.updateOne({removed: true});
		}
	} else {
		if(!applicationMethod.team) throw '该基金不允许团队申请！';
		if(members.length === 0) throw '团队申请必须要有组员，若没有组员请选择个人申请！';
		let agreeUsers = [];
		let disagreeUsers = [];
		let notModifiedUsers = [];
		for(let m of members) {
			if(m.removed === true) continue;
			if(m.agree === false) disagreeUsers.push(m.uid);
			if(m.agree === true) agreeUsers.push(m.uid);
			if(m.agree === null) notModifiedUsers.push(m.uid);
		}
		if(agreeUsers.length === 0) throw '没有好友接受邀请，暂不能提交团队申请！';

		// 过滤掉暂未处理邀请的用户和拒绝邀请的用户，并且从附加帖子中过滤掉这些用户的帖子
		for(let thread of threads.applying) {
			if(notModifiedUsers.includes(thread.uid) || disagreeUsers.includes(thread.uid)) {
				const index = threadsId.applying.indexOf(thread.tid);
				threadsId.applying.splice(index, 1);
			}
		}
		for(let m of members) {
			if(disagreeUsers.includes(m.uid) || notModifiedUsers.includes(m.uid)) {
			  await FundApplicationUserModel.updateOne({
          applicationFormId: this._id, uid: m.uid
        }, {
			    $set: {
			      removed: true
          }
        });
			}
		}

	}
	//系统审核
	if(fund.auditType === 'system') {
		status.projectPassed = true;
		status.adminSupport = true;
		if(!this.timeToPassed) {
			this.timeToPassed = Date.now();
		}
		this.remittance = [{
			money: this.money,
			status: null
		}];
		if(!fixedMoney) { //非固定金额
			for(let b of budgetMoney) {
				const total = b.count*b.money;
				if(!b.fact) {
					b.fact = total;
				}
				if(!b.suggest) {
					b.suggest = total;
				}
			}
			await this.updateOne({budgetMoney});
		}
	} else {
		this.remittance = [];
		this.status.projectPassed = null;
		this.status.adminSupport = null;
	}
	this.status.submitted = true;
	this.modifyCount += 1;
	this.timeToSubmit = Date.now();
	this.submittedReport = false;
	this.tlm = Date.now();
	//存历史
	const oldApplicationForm = await FundApplicationForm.findOnly({_id: this._id});
	const newObj = oldApplicationForm.toObject();
	newObj.applicationFormId = newObj._id;
	newObj._id = undefined;
	newObj.applicant = await this.extendApplicant();
	newObj.members = await this.extendMembers();
	newObj.project = await this.extendProject();
	newObj.comments = await FundDocumentModel.find({applicationFormId: this._id, type: 'comment'});
	newObj.adminAudit = await FundDocumentModel.findOne({applicationFormId: this._id, type: 'adminAudit'}).sort({toc: -1});
	newObj.userInfoAudit = await FundDocumentModel.findOne({applicationFormId: this._id, type: 'userInfo'}).sort({toc: -1});
	newObj.projectAudit = await FundDocumentModel.findOne({applicationFormId: this._id, type: 'projectAudit'}).sort({toc: -1});
	newObj.moneyAudit = await FundDocumentModel.findOne({applicationFormId: this._id, type: 'moneyAudit'}).sort({toc: -1});
	const newHistory = new FundApplicationFormHistoryModel(newObj);

  // 网友支持
  if(fund.supportCount <= supportersId.length) {
    status.usersSupport = true;
    if(fund.auditType === "person") {
      await mongoose.model("messages").sendFundMessage(this._id, "expert");
    }
  }

	await this.save();
	await newHistory.save();

	const fundForums = await ForumModel.find({kindName: "fund"});
	let fundForumsId = fundForums.map(f => f.fid);
	if(!fundForumsId.includes(category)) fundForumsId.unshift(category);
	// 生成文章
  let formThread;
  if(this.tid) {
    formThread = await ThreadModel.findOne({tid: this.tid});
  }
  if(!formThread) {
    const formPost = await ForumModel.createNewThread({
      fids: fundForumsId,
      uid: this.uid,
      type: "fund",
      c: project.c,
      t: project.t,
      abstractEn: project.abstractEn,
      abstractCn: project.abstractCn,
      keyWordsEn: project.keyWordsEn,
      keyWordsCn: project.keyWordsCn,
      l: "html"
    });
    await FundApplicationForm.updateOne({_id: this._id}, {$set: {tid: formPost.tid}});
    await elasticSearch.save("thread", formPost);
    await ThreadModel.updateOne({tid: formPost.tid}, {$set: {reviewed: true}});
    await PostModel.updateOne({pid: formPost.pid}, {$set: {reviewed: true}});
  } else {
    await formThread.updateOne({mainForumsId: fundForumsId});
    const formPost = await PostModel.findOnly({pid: formThread.oc});
    formPost.c = project.c;
    formPost.t = project.t;
    formPost.abstractEn = project.abstractEn;
    formPost.abstractCn = project.abstractCn;
    formPost.keyWordsEn = project.keyWordsEn;
    formPost.keyWordsCn = project.keyWordsCn;
    formPost.l = "html";
    formPost.mainForumsId = fundForumsId;
    formPost.uid = this.uid;
    await formPost.save();
  }

};

fundApplicationFormSchema.statics.extendAsApplicationFormList = async (applicationForms) => {
  const FundModel = mongoose.model('funds');
  const UserModel = mongoose.model('users');
  const FundDocumentModel = mongoose.model('fundDocuments');
  const FundApplicationUserModel = mongoose.model('fundApplicationUsers');
  const fundsId = [];
  const applicationFormId = [];
  const usersId = [];
  const projectsId = [];
  applicationForms.map(a => {
    const {fundId, _id, projectId} = a;
    fundsId.push(fundId);
    applicationFormId.push(_id);
    projectsId.push(projectId);
  });
  const projects = await FundDocumentModel.find({_id: {$in: projectsId}}, {
    t: 1, _id: 1
  });
  const projectsObj = {};
  projects.map(p => projectsObj[p._id] = p);
  const funds = await FundModel.find({_id: {$in: fundsId}}, {_id: 1, name: 1});
  const fundsObj = {};
  funds.map(f => fundsObj[f._id] = f);
  const members = await FundApplicationUserModel.find({
    applicationFormId: {$in: applicationFormId},
    removed: false
  }, {
    uid: 1,
    applicationFormId: 1
  }).sort({toc: 1});
  const applicationFormToUser = {};
  members.map(m => {
    const {uid, applicationFormId} = m;
    if(!applicationFormToUser[applicationFormId]) applicationFormToUser[applicationFormId] = [];
    applicationFormToUser[applicationFormId].push(uid);
    usersId.push(uid);
  });
  const users = await UserModel.find({uid: {$in: usersId}}, {
    uid: 1,
    avatar: 1,
    username: 1
  });
  const usersObj = {};
  users.map(u => usersObj[u.uid] = u);
  const results = [];
  for(const a of applicationForms) {
    const fund = fundsObj[a.fundId];
    if(!fund) continue;
    const status = await a.getStatus();
    const usersId = applicationFormToUser[a._id] || [];
    const users = [];
    for(const uid of usersId) {
      const u = usersObj[uid];
      if(!u) continue;
      users.push(u);
    }
    const project = projectsObj[a.projectId];
    const result = {
      _id: a._id,
      code: a.code,
      fundName: fund.name,
      fundId: fund._id,
      money: a.money,
      time: moment(a.toc).format(`YYYY/MM/DD`),
      title: project? project.t: '暂未填写项目名称',
      status: status.description,
      statusColor: status.color,
      users
    };
    results.push(result);
  }
  return results;
};


/*
* 获取基金申请表状态
* @return {Object}
*   @param {Number} general 总状态
*     1. 申请表无效
*     2. 申请表未提交，可能是因为用户未提交或审核未通过
*     3. 申请表正在等待支持或审核
*     4. 申请项目正在执行中
*     5. 申请项目已结题
*   @param {Number} detail 总状态下的子状态 详细说明见此方法末尾
*   @param {String} 当前申请表的相关说明
* */
fundApplicationFormSchema.methods.getStatus = async function() {
  let formStatus = [];
  const {useless, submittedReport, status, completedAudit, lock} = this;
  const {submitted, projectPassed, adminSupport, remittance, completed, successful, usersSupport} = status;
  let needRemittance = false;
  for(let r of this.remittance) {
    if(r.passed && !r.status) {
      needRemittance = true;
      break;
    }
  }
  if(this.disabled) {
    formStatus = [1, 1];
  } else if(useless === 'giveUp') {
    formStatus = [1, 2];
  } else if(useless === 'delete') {
    formStatus = [1, 3];
  } else if(useless === 'exceededModifyCount') {
    formStatus = [1, 4];
  } else if(useless === 'refuse') {
    formStatus = [1, 5];
  } else if(completed === true) {
    if(successful) {
      formStatus = [5, 2];
    } else {
      formStatus = [5, 1];
    }
  } else if(!submitted || !lock.submitted) {
    if(projectPassed === false) {
      formStatus = [2, 2];
    } else if(adminSupport === false) {
      formStatus = [2, 3];
    } else {
      formStatus = [2, 1];
    }
  } else if(!usersSupport) {
    formStatus = [3, 1];
  } else if(projectPassed === null) {
    formStatus = [3, 2];
  } else if(projectPassed === false) {
    formStatus = [2, 2];
  } else if(adminSupport === null) {
    formStatus = [3, 3];
  } else if(adminSupport === false) {
    formStatus = [2, 3];
  } else if(remittance === null) {
    formStatus = [4, 2];
  } else if(remittance === false) {
    formStatus = [4, 3];
  } else if(submittedReport) {
    formStatus = [4, 4];
  } else if(needRemittance) {
    formStatus = [4, 2];
  } else if(completedAudit) {
    formStatus = [4, 6];
  } else if(completed === null) {
    formStatus = [4, 1];
  } else if(completed === false) {
    formStatus = [4, 7];
  } else if(successful) {
    formStatus = [5, 2];
  } else if(!successful) {
    formStatus = [5, 1];
  }

  const descriptions = {
    '1-1': '已被屏蔽',
    '1-2': '已被申请人放弃',
    '1-3': '已被申请人删除',
    '1-4': '退休次数超过限制',
    '1-5': '已被彻底拒绝',

    '2-1': '未提交',
    '2-2': '未通过专家审核，等待申请人修改',
    '2-3': '未通过管理员复核，等待申请人修改',

    '3-1': '等待网友支持',
    '3-2': '等待专家审核',
    '3-3': '等待管理员复核',

    '4-1': '项目进行中',
    '4-2': '等待拨款',
    '4-3': '拨款出错',
    '4-4': '等待报告审核',
    '4-5': '未通过报告审核，等待申请人修改',
    '4-6': '等待结题审核',
    '4-7': '未通过结题审核，等待申请人修改',

    '5-1': '正常结题',
    '5-2': '成功结题'
  };


  const key = `${formStatus[0]}-${formStatus[1]}`;

  const color = [
    '3-1', '3-2', '3-3', '4-1', '4-2', '4-4', '4-6', '5-1', '5-2'
  ].includes(key)? '#333': 'red';

  const description = descriptions[key];

  return {
    general: formStatus[0],
    detail: formStatus[1],
    description,
    color,
  };
};

/*
* 获取申请表的显示金额
* @param {[Object]} 申请表上的资金预算字段
* @param {Object} fundMoney 基金项目上的金额设置
* @return {Number} 计算所得金额
* */

fundApplicationFormSchema.methods.updateMoney = async function() {
  const {fixedMoney, budgetMoney} = this;
  if(fixedMoney) return;
  const {
    general,
  } = await this.getStatus();
  let result = 0;
  for(const b of budgetMoney) {
    const {fact, money, count} = b;
    if(general < 4) {
      result += money * count * 100;
    } else {
      result += fact * 100;
    }
  }
  const money = result / 100;
  await this.updateOne({$set: {money}});
  return money;
};

fundApplicationFormSchema.statics.updateMoneyByApplicationFormId = async (applicationFormId) => {
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const applicationForm = await FundApplicationFormModel.findOnly({_id: applicationFormId});
  return await applicationForm.updateMoney();
};


const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;
