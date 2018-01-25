const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fs = require('fs');
const {promisify} = require('util');
const copyFile = promisify(fs.copyFile);
const fundApplicationFormSchema = new Schema({
  _id: Number,
	order: {
  	type: Number,
		default: '',
		index: 1
	},
	code: {// 申请编号 如：2017A02
		type: String,
		default: ''
	},
  fundId: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    index: 1
  },
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
  budgetMoney: { // 预算
    type: Schema.Types.Mixed,
    default: null
    /*
    {
      purpose: String,
      money: Number,
      count: Number,
			total: Number
    }
    */
  },
  projectCycle: { // 预计周期
	  type: Number,
	  default: null,
	  index: 1
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
    paymentMethod: {
      type: String,
      default: null
    },
    number: {
      type: Number,
      default: null
    }
  },
  projectId: {
    type: Number,
	  default: null,
	  index: 1
  },
  status: {
	  submitted: { // 已提交申请
			type: Boolean,
		  default: null
	  },
    usersSupport: { // 获得网友支持
      type: Boolean,
      default: null,
      index: 1
    },
	  usersMessagesPassed: { // 申请人信息审核通过
		  type: Boolean,
		  default: null,
		  index: 1
	  },
    projectPassed: { // 项目审核通过
      type:Boolean,
      default: null,
      index: 1
    },
    adminAgree: { // 管理员同意
      type: Boolean,
      default: null,
      index: 1
    },
    remittance: { // 已打款
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
	useless: { //disabled: 被封禁，revoked: 被永久撤销，exceededModifyCount: 超过修改次数， null: 数据有效
  	type: String,
		default: null,
		index: 1
	},
  lock: {
    status: {
      type: Number,
      default: 0, // 0未提交， 1已提交， 2正在审批， 3审核完成
      index: 1
    },
    uid: {
      type: String,
      default: '',
      index: 1
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
  supporter: {// 支持的人
    type: [String],
    default: [],
    index: 1
  },
  objector: { // 反对的人
    type: [String],
    default: [],
    index: 1
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


fundApplicationFormSchema.pre('save', function(next) {
  if(!this.timeOfLastRevise) {
    this.timeOfLastRevise = this.timeToCreate;
  }
  next();
});

fundApplicationFormSchema.methods.extendUser = async function() {
	const UserModel = require('./UserModel');
	const user = await UserModel.findOnly({uid: this.uid});
	return this.user = user;
};

fundApplicationFormSchema.methods.extendApplicant = async function() {
	const FundApplicationUserModel = require('./FundApplicationUserModel');
	const applicant= await FundApplicationUserModel.findOne({applicationFormId: this._id, uid: this.uid});
	if(applicant) await applicant.extendUser();
	return this.applicant = applicant;
};

fundApplicationFormSchema.methods.extendMembers = async function() {
	const FundApplicationUserModel = require('./FundApplicationUserModel');
	const applicationUsers = await FundApplicationUserModel.find({applicationFormId: this._id, uid: {$ne: this.uid}, removed: false}).sort({toc: 1});

	return this.members = await Promise.all(applicationUsers.map(async aUser => {
		await aUser.extendUser();
		return aUser;
	}));
};

fundApplicationFormSchema.methods.extendFund = async function() {
	const FundModel = require('./FundModel');
	const fund = await FundModel.findOnly({_id: this.fundId, display: true});
	return this.fund = fund;
};

fundApplicationFormSchema.methods.extendProject = async function() {
	const DocumentModel = require('./DocumentModel');
	if(this.projectId === null) return null;
	const project = await DocumentModel.findOne({_id: this.projectId});
	return this.project = project;
};

fundApplicationFormSchema.methods.extendThreads = async function() {
	const ThreadModel = require('./ThreadModel');
	const {threadsId} = this;
	const threads = {};
	threads.applying = await Promise.all(threadsId.applying.map(async tid => {
		const thread = await ThreadModel.findOnly({tid});
		await thread.extendFirstPost().then(p => p.extendUser());
		return thread;
	}));
	threads.completed = await Promise.all(threadsId.completed.map(async tid => {
		const thread = await ThreadModel.findOnly({tid});
		await thread.extendFirstPost().then(p => p.extendUser());
		return thread;
	}));
	return this.threads = threads;
};

fundApplicationFormSchema.methods.newProject = async function(project) {
	const DocumentModel = require('./DocumentModel');
	const SettingModel = require('./SettingModel');
	const id = await SettingModel.operateSystemID('documents', 1);
	const {t, c} = project;
	const newDocument = new DocumentModel({
		_id: id,
		t,
		c,
		uid: this.uid,
		applicationFormsId: this._id,
		type: 'article',
		l: 'pwbb'
	});
	await newDocument.save();
	return this.project = newDocument;
};

fundApplicationFormSchema.methods.ensureInformation = async function() {
	const PhotoModel = require('./PhotoModel');
	const FundApplicationForm = mongoose.model('fundApplicationForms');
	const {
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
		objector
	} = this;
	const {
		money,
		thread,
		applicationMethod,
	} = fund;

	// 判断申请表有效性
	if(useless !== null) throw '申请表已作废！';
	// 申请人信息判断
	if(!applicant.lifePhotosId || applicant.lifePhotosId.length === 0) {
		throw '请至少添加一张生活照！';
	}
	if(!applicant.name) throw '请填写您的真实姓名！';
	if(!applicant.idCardNumber) throw '请填写您的身份证号码！';
	if(!applicant.mobile) throw '请填写您的联系电话！';
	if(!account.paymentMethod) throw '请选择收款方式！';
	if(!account.number) throw '请填写您的收款账号！';
	if(!applicant.description) throw '请填写您的自我介绍！';

	// 项目信息判断
	if(!projectId) {
		throw '请填写项目信息！';
	} else {
		if(!project.t) throw '请填写项目名称！';
		if(!project.c) throw '请输入项目名称！';
	}

	//其他信息判断
	if (projectCycle === null) throw '请填写研究周期！';
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
	if(thread.count > threadsId.applying.length) throw `附带的帖子数未达到最低要求(至少${thread.count}篇)`;
	// 如果是个人申请，则删除所有组员已存到基金（type='fund'）的生活照，并标记所有组员为已删除
	if(from === 'personal') {
		if(!applicationMethod.individual) throw '该基金不允许个人申请！';
		for(let u of members) {
			const {lifePhotosId} = u;
			for(let _id of lifePhotosId) {
				const photo = await PhotoModel.findOnly({_id});
				if(photo.type === 'fund') await photo.remove();
			}
			await u.update({removed: true});
		}
	} else {
		if(!applicationMethod.group) throw '该基金不允许团队申请！';
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
				await m.update({removed: true});
			}
		}

	}
	this.status.submitted = true;
	await this.save();
};

const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;
