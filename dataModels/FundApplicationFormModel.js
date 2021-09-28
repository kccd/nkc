const settings = require('../settings');
const moment = require('moment');
const FundDocumentModel = require("./FundDocumentModel");
const FundApplicationFormHistoryModel = require("./FundApplicationHistoryModel");
const elasticSearch = require("../nkcModules/elasticSearch");
const nkcRender = require("../nkcModules/nkcRender");
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
	// 是否固定金额
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
      money: Number,   // 单价 0.01
      count: Number,   // 数量
      total: Number, // 总计 0.01 单价 * 数量
			suggest: Number, // 专家建议
			fact: Number     // 管理员最后批准

			unit: String, // 单位
      model: String, // 型号
    }
    */
  },
  // 结题时填写的各个物品的实际花费
	actualMoney: {
  	type: [Schema.Types.Mixed],
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
  // 审核方式
  // person: 人工, system: 系统
  auditType: {
    type: String,
    default: 'person'
  },
  // 预计周期
  projectCycle: {
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
    refund: { // 退款相关
      type: Boolean,
      default: null, // null: 不需要退款，false: 未退款， true: 已退款
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
	useless: {
    //giveUp: 放弃申请，
    // exceededModifyCount: 超过修改次数，
    // null: 数据有效,
    // refuse：永久拒绝,
    // stop: 中止
  	type: String,
		default: null,
		index: 1
	},
	disabled: {
  	type: Boolean,
		default: false,
		index: 1
	},
  // 是否需要报告审核（申请拨款时提交的报告）
	submittedReport: {
		type: Boolean,
		default: false,
		index: 1
	},
  // 是否提交了结题申请
	completedAudit: {
		type: Boolean,
		default: false,
		index: 1
	},
  // 如果需要退款此字段表示退款账单（bills）的 ID
  refundBillId: {
    type: String,
    default: '',
    index: 1
  },
  // 退款金额，元，精确到 0.01
  refundMoney: {
    type: Number,
    default: 0
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
    /*{
        money: form.money,
        status: null,
        report: null,
        passed: null,
        verify: false,
        apply: false,
        threads: [String] 附带的文章
        uid: String, 拨款人
        time: Date, 拨款时间
      }*/
  	type: [Schema.Types.Mixed],
		default: []
	},
  // 开源协议
  protocol: {
    type: String,
    default: ''
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

fundApplicationFormSchema.virtual('formStatus')
  .get(function() {
    return this._formStatus;
  })
  .set(function(formStatus) {
    this._formStatus = formStatus;
  });

fundApplicationFormSchema.virtual('auditComments')
  .get(function() {
    return this._auditComments;
  })
  .set(function(auditComments) {
    this._auditComments = auditComments;
  });


fundApplicationFormSchema.virtual('reports')
  .get(function() {
    return this._reports;
  })
  .set(function(reports) {
    this._reports = reports;
  });

fundApplicationFormSchema.virtual('projectPost')
  .get(function() {
    return this._projectPost;
  })
  .set(function(projectPost) {
    this._projectPost = projectPost;
  });

fundApplicationFormSchema.virtual('posts')
  .get(function() {
    return this._posts;
  })
  .set(function(posts) {
    this._posts = posts;
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
	const FundApplicationUserModel = mongoose.model('fundApplicationUsers');
	const FundBlacklistModel = mongoose.model('fundBlacklist');
	const applicant= await FundApplicationUserModel.findOne({applicationFormId: this._id, uid: this.uid});
	if(applicant) {
		await applicant.extendUser();
		if(!extendSecretInfo) {
			applicant.mobile = null;
			applicant.idCardNumber = null;
		}
    applicant.inFundBlacklist = await FundBlacklistModel.inBlacklist(applicant.uid);
	}
	return this.applicant = applicant;
};

fundApplicationFormSchema.methods.extendMembers = async function() {
  const FundApplicationUserModel = mongoose.model('fundApplicationUsers');
	const applicationUsers = await FundApplicationUserModel.find({applicationFormId: this._id, uid: {$ne: this.uid}, removed: false}).sort({toc: 1});

	return this.members = await Promise.all(applicationUsers.map(async aUser => {
		await aUser.extendUser();
		return aUser.toObject();
	}));
};

fundApplicationFormSchema.methods.extendForum = async function() {
	let forum;
	if(this.category) {
	  const ForumModel = mongoose.model('forums');
		forum = await ForumModel.findOne({fid: this.category});
	}
	return this.forum = forum;
};

fundApplicationFormSchema.methods.extendFund = async function() {
  const FundModel = mongoose.model('funds');
	const fund = await FundModel.findOne({_id: this.fundId, disabled: false});
	// if(!fund) throw '抱歉！该基金项目已被屏蔽，所有基金申请表暂不能查看。';
	return this.fund = fund;
};

fundApplicationFormSchema.methods.extendProject = async function() {
  const project =  await this.initProject();
  return this.project = project;
};

fundApplicationFormSchema.methods.extendThreads = async function() {
  const ThreadModel = mongoose.model('threads');
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
	const UserModel = mongoose.model('users');
	const supporters = [];
  const users = await UserModel.find({uid: {$in: this.supportersId}});
  const usersObj = {};
  for(const user of users) {
    usersObj[user.uid] = user;
  }
  for(const uid of this.supportersId) {
    const user = usersObj[uid];
    if(user && !supporters.includes(user)) {
      supporters.push(user);
    }
  }
	return this.supporters = supporters;
};

fundApplicationFormSchema.methods.extendObjectors = async function() {
	const UserModel = mongoose.model('users');
	const objectors = [];
	for(let uid of this.objectorsId) {
		const user = await UserModel.findOnly({uid});
		objectors.push(user);
	}
	return this.objectors = objectors;
};

fundApplicationFormSchema.methods.extendReportThreads = async function() {
	const ThreadModel = mongoose.model('threads');
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

/*
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
*/

// 提交申请表 进入审核流程
fundApplicationFormSchema.statics.publishByApplicationFormId = async (applicationFormId) => {
  const FundModel = mongoose.model('funds');
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const MessageModel = mongoose.model('messages');
  const SettingModel = mongoose.model('settings');
  const ForumModel = mongoose.model('forums');
  const PostModel = mongoose.model('posts');
  const ThreadModel = mongoose.model('threads');
  const FundApplicationFormHistoryModel = mongoose.model('fundApplicationHistories');
  const FundDocumentModel = mongoose.model('fundDocuments');
  const elasticSearch = require('../nkcModules/elasticSearch');
  const form = await FundApplicationFormModel.findOnly({_id: applicationFormId});
  const oldForm = form.toObject();
  const fund = await FundModel.findOnly({_id: form.fundId});
  const now = new Date();
  if(!form.timeToPassed) {
    form.timeToPassed = now;
  }
  if(form.auditType === 'system') {
    // 系统审核 自动审核
    form.status.projectPassed = true;
    form.status.adminSupport = true;
    // 自动分为一期打款
    form.remittance = [
      {
        money: form.money,
        status: null,
        report: null, // 提交报告
        passed: null, // 通过审核
        verify: false, // 确认收款
        apply: false, // 已申请
      }
    ];
    form.budgetMoney.map(b => {
      b.suggest = b.total;
      b.fact = b.total;
    });
  } else {
    // 人工审核
    form.status.projectPassed = null;
    form.status.adminSupport = null;
  }
  form.status.submitted = true;
  form.lock.submitted = true;
  form.modifyCount += 1;
  form.submittedReport = false;
  form.tlm = now;
  form.timeToSubmit = now;
  oldForm.applicationFormId = oldForm._id;
  oldForm._id = undefined;
  oldForm.applicant = await form.extendApplicant();
  oldForm.members = await form.extendMembers();
  oldForm.project = await form.extendProject();
  oldForm.comments = await FundDocumentModel.find({applicationFormId: form._id, type: 'comment'});
  oldForm.adminAudit = await FundDocumentModel.findOne({applicationFormId: form._id, type: 'adminAudit'}).sort({toc: -1});
  oldForm.userInfoAudit = await FundDocumentModel.findOne({applicationFormId: form._id, type: 'userInfo'}).sort({toc: -1});
  oldForm.projectAudit = await FundDocumentModel.findOne({applicationFormId: form._id, type: 'projectAudit'}).sort({toc: -1});
  oldForm.moneyAudit = await FundDocumentModel.findOne({applicationFormId: form._id, type: 'moneyAudit'}).sort({toc: -1});
  const newHistory = new FundApplicationFormHistoryModel(oldForm);
  // 网友支持
  if(fund.supportCount <= form.supportersId.length) {
    form.status.usersSupport = true;
    if(form.auditType === "person") {
      await MessageModel.sendFundMessage(form._id, "expert");
    }
  }
  const fundForums = await ForumModel.find({kindName: "fund"}, {fid: 1});
  let fundForumsId = fundForums.map(f => f.fid);
  if(!fundForumsId.includes(form.category)) fundForumsId.unshift(form.category);
  // 生成文章
  let formThread;
  if(form.tid) {
    formThread = await ThreadModel.findOne({tid: form.tid});
  }
  if(!formThread) {
    const formPost = await ForumModel.createNewThread({
      fids: fundForumsId,
      uid: form.uid,
      type: "fund",
      c: form.project.c,
      t: form.project.t,
      abstractEn: form.project.abstractEn,
      abstractCn: form.project.abstractCn,
      keyWordsEn: form.project.keyWordsEn,
      keyWordsCn: form.project.keyWordsCn,
      l: "html"
    });
    form.tid = formPost.tid;
    await elasticSearch.save("thread", formPost);
    await ThreadModel.updateOne({tid: formPost.tid}, {$set: {reviewed: true}});
    await PostModel.updateOne({pid: formPost.pid}, {$set: {reviewed: true}});
  } else {
    await formThread.updateOne({mainForumsId: fundForumsId});
    const formPost = await PostModel.findOnly({pid: formThread.oc});
    formPost.c = form.project.c;
    formPost.t = form.project.t;
    formPost.abstractEn = form.project.abstractEn;
    formPost.abstractCn = form.project.abstractCn;
    formPost.keyWordsEn = form.project.keyWordsEn;
    formPost.keyWordsCn = form.project.keyWordsCn;
    formPost.l = "html";
    formPost.mainForumsId = fundForumsId;
    formPost.uid = form.uid;
    await formPost.save();
  }
  await form.save();
  await form.updateOne({
    $set: {
      budgetMoney: form.budgetMoney
    }
  });
  await newHistory.save();

  await form.createReport('system', '提交申请表');
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
  const {
    submitted,
    projectPassed,
    adminSupport,
    remittance,
    completed,
    successful,
    usersSupport,
    excellent,
    refund
  } = status;
  let needRemittance = false;
  for(let i = 0; i < this.remittance.length; i++) {
    const r = this.remittance[i];
    if(!r.status && r.apply && (i === 0 || r.passed)) {
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
  } else if (useless === 'stop') {
    formStatus = [1, 6];
  } else if(useless === 'timeout') {
    formStatus = [1, 7];
  } else if(completed === true) {
    if(refund === false) {
      formStatus = [6, 1];
    } else if(excellent) {
      formStatus = [5, 3]
    } else if(successful) {
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
  } else if(completedAudit) {
    formStatus = [4, 6];
  /*} else if(remittance === null) {
    formStatus = [4, 2];*/
  } else if(remittance === false) {
    formStatus = [4, 3];
  } else if(submittedReport) {
    formStatus = [4, 4];
  } else if(needRemittance) {
    formStatus = [4, 2];
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
    '1-2': '申请人已放弃申报',
    '1-3': '已被申请人删除',
    '1-4': '修改次数超过限制',
    '1-5': '已被永久拒绝',
    '1-6': '已终止',
    '1-7': '申请人修改超时，已视为放弃',

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
    '5-2': '成功结题',
    '5-3': '优秀项目',

    '6-1': '等待申请人退款'
  };

  const key = `${formStatus[0]}-${formStatus[1]}`;

  const color = [
    '3-1', '3-2', '3-3', '4-1', '4-2', '4-4', '4-6', '5-1', '5-2', '5-3', '6-1'
  ].includes(key)? '#333': 'red';

  const description = descriptions[key];

  return this.formStatus = {
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
  const FundModel = mongoose.model('funds');
  const {fixedMoney, budgetMoney} = this;
  let money;
  if(fixedMoney) {
    const fund = await FundModel.findOne({_id: this.fundId});
    money = fund.money.value;
  } else {
    const {
      general,
    } = await this.getStatus();
    let result = 0;
    for(const b of budgetMoney) {
      const {fact, total} = b;
      if(general < 4) {
        result += total * 100;
      } else {
        result += fact * 100;
      }
    }
    money = result / 100;
  }
  this.money = money;
  await this.updateOne({$set: {money}});
  return money;
};

fundApplicationFormSchema.statics.updateMoneyByApplicationFormId = async (applicationFormId) => {
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const applicationForm = await FundApplicationFormModel.findOnly({_id: applicationFormId});
  return await applicationForm.updateMoney();
};

/*
fundApplicationFormSchema.statics.syncLifePhotos = await () => {

};*/


/*
* 初始化申请人数据
* */
fundApplicationFormSchema.methods.initApplicant = async function() {
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const FundApplicationUserModel = mongoose.model('fundApplicationUsers');
  let applicant = await FundApplicationUserModel.findOne({
    applicationFormId: this._id,
    uid: this.uid
  });
  if(!applicant) {
    const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
    const authLevel = await userPersonal.getAuthLevel();
    applicant = FundApplicationUserModel({
      applicationFormId: this._id,
      mobile: userPersonal.mobile,
      uid: this.uid,
      type: 'applicant',
      authLevel,
    });
    await applicant.save();
  }
  return applicant;
}
/*
* 初始化项目内容数据
* */
fundApplicationFormSchema.methods.initProject = async function() {
  const SettingModel = mongoose.model('settings');
  const FundDocumentModel = mongoose.model('fundDocuments');
  let project;
  if(this.projectId) {
    project = await FundDocumentModel.findOnly({_id: this.projectId});
  } else {
    const documentId = await SettingModel.operateSystemID('fundDocuments', 1);
    project = FundDocumentModel({
      _id: documentId,
      uid: this.uid,
      applicationFormId: this._id,
      type: 'project',
    });
    await project.save();
    this.projectId = documentId;
    await this.save();
  }
  return project;
}

/*
* 更新项目信息
* */
fundApplicationFormSchema.methods.updateProject = async function(props) {
  const {
    t, c, abstractEn, abstractCn, keyWordsCn, keyWordsEn
  } = props;
  const FundDocumentModel = mongoose.model('fundDocuments');
  if(!this.projectId) {
    // 初始化项目信息
    await this.initProject();
  }
  // 更新项目信息
  const document = await FundDocumentModel.findOnly({_id: this.projectId});
  document.t = t;
  document.c = c;
  document.abstractEn = abstractEn;
  document.abstractCn = abstractCn;
  document.keyWordsCn = keyWordsCn;
  document.keyWordsEn = keyWordsEn;
  await document.save();
};
/*
* 创建一条报告
* @param {String} type 报告类型 system: 系统报告, report: 用户报告
* @param {String} content 报告内容
* @param {String} operatorId 操作者 ID 默认为申请人
* */
fundApplicationFormSchema.methods.createReport = async function(type, content, operatorId, support = null) {
  const SettingModel = mongoose.model('settings');
  const FundDocumentModel = mongoose.model('fundDocuments');
  const newId = await SettingModel.operateSystemID('fundDocuments', 1);
  const newReport = FundDocumentModel({
    type,
    uid: operatorId || this.uid,
    applicationFormId: this._id,
    _id: newId,
    c: content,
    support
  });
  await newReport.save();
  return newReport;
}

/*
* 移除申请表上的所有组员
* */
fundApplicationFormSchema.methods.removeAllMembers = async function() {
  const FundApplicationUserModel = mongoose.model('fundApplicationUsers');
  await FundApplicationUserModel.updateMany({
    applicationFormId: this._id,
    type: 'member',
    uid: {$ne: this.uid},
    removed: false,
  }, {
    $set: {
      removed: true
    }
  });
}


/*
* 获取申请表页面所需的申请人信息
* */
fundApplicationFormSchema.methods.getApplicantPageInfo = async function() {
  const applicant = await this.extendApplicant();
  const threads = await this.extendThreads();

};

/*
* 拓展申请表信息
* */
fundApplicationFormSchema.methods.extendApplicationForm = async function() {
  await this.extendProject();
  await this.extendMembers();
  await this.extendApplicant();
  await this.extendFund();
  await this.extendThreads();
  await this.extendForum();
};
/*
* 根据申请表状态获取审核评语
* */
fundApplicationFormSchema.methods.extendAuditComments = async function() {
  const FundDocumentModel = mongoose.model('fundDocuments');
  const auditComments = {};
  const form = this;
  const getReport = async (type) => {
    return await FundDocumentModel.findOne({
      type,
      applicationFormId: form._id,
      disabled: false,
    }, {
      support: 1,
      c: 1,
    }).sort({toc: -1});
  };

  if(this.status.projectPassed === false) {
    auditComments.userInfoAudit = await getReport('userInfoAudit');
    auditComments.projectAudit = await getReport('projectAudit');
    auditComments.moneyAudit = await getReport('moneyAudit');
  }
  if(this.status.adminSupport === false) {
    auditComments.adminAudit = await getReport('adminAudit');
  }
  if(this.status.completed === false) {
    auditComments.completedAudit = await getReport('completedAudit');
  }
  return this.auditComments = auditComments;
};



/*
* 拓展最新进展
* @param {Boolean} isAdmin 是否为管理人员 管理人员可加载封禁的信息
* */
fundApplicationFormSchema.methods.extendReports = async function(isAdmin = false) {
  const FundDocumentModel = mongoose.model('fundDocuments');
  const match = {
    applicationFormId: this._id,
    type: {$in: ['refuse', 'report', 'completedReport', 'system', 'completedAudit', 'adminAudit', 'userInfoAudit', 'projectAudit', 'moneyAudit', 'remittance']},
  };
  if(!isAdmin) {
    match.disabled = false;
  }
  return this.reports = await FundDocumentModel.find(match).sort({toc: 1});
}

/*
* 拓展项目内容，提交过则从posts获取，未提交则从fundDocuments获取
* */
fundApplicationFormSchema.methods.extendProjectPost = async function() {
  const PostModel = mongoose.model('posts');
  const ResourceModel = mongoose.model('resources');
  const nkcRender = require('../nkcModules/nkcRender');
  if(this.tid) {
    const firstPost = await PostModel.findOnly({tid: this.tid, type: 'thread'});
    firstPost.c = nkcRender.renderHTML({
      type: 'article',
      post: {
        c: firstPost.c,
        resources: await ResourceModel.getResourcesByReference(firstPost.pid)
      }
    });
    this.projectPost = firstPost;
  } else {
    const project = this.project? this.project: await this.extendProject();
    project.c = nkcRender.renderHTML({
      type: 'article',
      post: {
        c: project.c,
        resources: await ResourceModel.getResourcesByReference(`fund-${project._id}`)
      }
    });
    this.projectPost = project;
  }
};

/*
* 检查拨款期号是否正确
* @param {Number} number 拨款期号
* */
fundApplicationFormSchema.methods.checkRemittanceNumber = async function(number) {
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const form = await FundApplicationFormModel.findOnly({_id: this._id}, {remittance: 1});
  const {remittance} = form;
  for(let i = 0; i < remittance.length; i++) {
    const {passed, verify, status} = remittance[i];
    if(i < number) {
      if(!status) throwErr(403, `第 ${i + 1} 期拨款尚未完成`);
      if(!verify) throwErr(403, `第 ${i + 1} 期拨款尚未确认`);
    } else if (i === number){
      if(status) throwErr(403, `拨款已完成`);
    }
  }
}

/*
* 拨款
* @param {Object} props
*   @param {Number} number 拨款期号
*   @param {clientIp} 操作者 IP
*   @param {clientPort} 操作者 port
*   @param {String} operatorId 操作者 ID
* */
fundApplicationFormSchema.methods.transfer = async function(props) {
  const {number, clientIp, clientPort, operatorId} = props;
  const {disabled, useless, remittance, status} = this;
  if(disabled) throwErr(403, `申请表已被封禁`);
  if(useless !== null) throwErr(403, `申请表已失效`);
  if(status.completed) throwErr(403, `项目已结题`);
  if(!status.adminSupport) throwErr(403, `未通过管理员符合`);
  const redLock = require('../nkcModules/redLock');
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const AliPayRecordModel = mongoose.model('aliPayRecords');
  const FundBillModel = mongoose.model('fundBills');
  const lock = await redLock.lock(`fundTransfer:${this._id}`, 6000);
  try{
    await this.checkRemittanceNumber(number);
    const money = remittance[number].money * 100;
    const balance = await FundBillModel.getBalance('fund', this.fundId);
    if(balance * 100 < money) throwErr(500, `基金余额不足`);
    const record = await AliPayRecordModel.transfer({
      uid: this._id,
      money,
      effectiveMoney: money,
      fee: 0,
      aliPayAccount: this.account.number,
      aliPayAccountName: this.account.name,
      clientIp,
      clientPort,
      from: 'fund',
      description: '基金拨款'
    });
    await FundBillModel.createRemittanceBill({
      fundId: this.fundId,
      uid: this.uid,
      applicationFormId: this._id,
      money: money / 100,
      number,
      applicationFormCode: this.code,
      operatorId: operatorId || this.uid,
      paymentType: 'aliPay',
      paymentId: record._id
    });
    remittance[number].status = true;
    this.remittance = remittance;
    await this.updateOne({
      $set: {
        remittance: remittance
      }
    });
  } catch(err) {
    await lock.unlock();
    throw(err);
  }
}

/*
* 拓展回复
* */
fundApplicationFormSchema.methods.extendPosts = async function(accessForumsId) {
  const PostModel = mongoose.model('posts');
  let posts = [];
  if(this.tid) {
    posts = await PostModel.find({
      mainForumsId: {$in: accessForumsId},
      tid: this.tid,
      type: 'post',
      parentPostId: '',
      disabled: false,
      reviewed: true,
      toDraft: {$ne: true}
    }).sort({toc: -1}).limit(10);
    posts = await PostModel.extendPosts(posts);
    posts = await PostModel.filterPostsInfo(posts);
    posts = posts.reverse();
  }
  return this.posts = posts;
};

/*
* 拓展申请表信息
* */
fundApplicationFormSchema.methods.extendApplicationFormBaseInfo = async function() {
  await this.extendFund();
  await this.extendMembers();
  await this.extendApplicant().then(u => u.extendLifePhotos());
  await this.extendProject();
  await this.extendProjectPost();
  await this.extendThreads();
  await this.extendForum();
};
fundApplicationFormSchema.methods.extendApplicationFormInfo = async function(uid, accessForumsId = []) {
  const {fund} = this;
  if(
    this.disabled &&
    !await fund.isFundRole(uid, 'admin')
  ) throwErr(403, `申请表已被屏蔽`);
  const {applicant, members} = this;
  const membersId = members.map(m => m.uid);
  // 未提交时仅自己和全部组员可见
  if(
    !await fund.isFundRole(uid, 'admin') &&
    this.status.submitted !== true &&
    uid !== applicant.uid &&
    !membersId.includes(uid)
  ) throwErr(403, `权限不足`);
  await this.extendSupporters();
  await this.extendObjectors();
  await this.extendReportThreads();
  await this.extendAuditComments();
  await this.extendReports();
  await this.extendPosts(accessForumsId);
  await this.getStatus();
};

/*
* 隐藏申请表的敏感信息
* */
fundApplicationFormSchema.methods.hideSecretInfo = async function() {
  this.applicant.mobile = null;
  this.applicant.idCardNumber = null;
  this.account.paymentType = null;
  this.account.number = null;
  for(let m of this.members) {
    m.mobile = null;
    m.idCardNumber = null;
  }
  //拦截表示反对的用户
  this.objectors = [];
};

/*
* 隐藏反对用户
* */
fundApplicationFormSchema.methods.hideObjectors = async function() {
  this.objectors = [];
};

/*
* 隐藏用户无权查看的信息
* @param {String} uid 访问者 ID
* @param {Boolean} hasPermission 是否拥有特殊权限
* */
fundApplicationFormSchema.methods.hideApplicationFormInfoByUserId = async function(uid, hasPermission) {
  const {fund} = this;
  const isAdmin =
    hasPermission ||
    await fund.isFundRole(uid, 'admin') ||
    await fund.isFundRole(uid, 'censor');
  const isApplicant = uid && uid === this.uid;

  if(!isAdmin) {
    // 非管理员无法查看反对用户
    await this.hideObjectors();
    if(!isApplicant) {
      // 非管理员非申请者无法查看敏感信息
      await this.hideSecretInfo();
    }
  }
}

/*
* 设置申请表的状态为申请人修改超时，已视为放弃
* */
fundApplicationFormSchema.methods.setUselessAsTimeout = async function(operatorId) {
  await this.createReport('system', `申请人修改超时，已视为放弃`, operatorId, false);
  await this.updateOne({
    $set: {
      useless: 'timeout'
    }
  });
};

/*
* 撤回申请
* @param {String} uid 操作人
* @param {String} reason 撤回的原因
* */
fundApplicationFormSchema.methods.withdraw = async function(uid, reason, applicant) {
  const {checkString} = require('../nkcModules/checkData');
  const {fund, uid: formUid} = this;
  checkString(reason, {
    name: '原因',
    minLength: 1,
    maxLength: 5000
  });
  if(
    uid !== formUid &&
    !await fund.isFundRole(uid, 'admin') &&
    !await fund.isFundRole(uid, 'financialStaff')
  ) throwErr(403, `权限不足`);
  if(this.remittance[0].status === true) throwErr(400, '无法撤回已拨款的基金申请');
  this.remittance.map(r => {
    r.apply = false;
  });
  await this.updateOne({
    'lock.submitted': false,
    'status.usersSupport': null,
    'status.projectPassed': null,
    'status.adminSupport': null,
    remittance: this.remittance
  });
  const name = applicant? '申请人': '管理员';
  await this.createReport('system', `申请已被${name}撤回\n原因：${reason}`, uid, false);
};

/*
* 获取基金申请需要退款的金额
* @return {Number} 退款金额，元，精确到 0.01
* */
fundApplicationFormSchema.methods.getRefundMoney = async function() {
  const {budgetMoney, actualMoney} = this;
  let money = 0;
  let usedMoney = 0;
  for(const b of budgetMoney) {
    money += b.fact * 100;
  }
  for(const a of actualMoney) {
    if(a.total) {
      usedMoney += a.total * 100;
    } else {
      usedMoney += a.money * 100 * a.count;
    }

  }
  return usedMoney >= money? 0: (Math.round(money - usedMoney) / 100);
};

/*
* 更新基金申请的退款状态
* @param {String} billId 基金账单 ID
* */
fundApplicationFormSchema.statics.updateRefundStatusByBillId = async (billId) => {
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const form = await FundApplicationFormModel.findOne({
    'status.refund': false,
    refundBillId: billId
  });
  if(!form) return;
  await form.updateOne({
    $set: {
      'status.refund': true
    }
  });
  await form.createReport('system', `申请人已退款 ${form.refundMoney} 元`, form.uid, null);
}
/*
* 人工设置基金申请退款状态
* */
fundApplicationFormSchema.methods.adminUpdateRefundStatus = async function(operatorId) {
  if(this.status.refund !== false)  return;
  const FundBillModel = mongoose.model('fundBills');
  const bill = await FundBillModel.createRefundBill({
    money: this.refundMoney,
    uid: this.uid,
    fundId: this.fundId,
    formId: this._id,
    paymentId: '',
    operatorId,
    paymentType: ''
  });
  await this.updateOne({
    $set: {
      refundBillId: bill._id,
    }
  });
  await bill.verifyPass();
};
/*
* 记录基金申请退款账单ID
* @param {String} billId 基金退款账单ID
* */
fundApplicationFormSchema.methods.saveRefundBillId = async function(billId) {
  this.refundBillId = billId;
  await this.save();
}

const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;