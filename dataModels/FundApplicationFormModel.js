const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationFormSchema = new Schema({
  _id: String,
	order: {
  	type: Number,
		default: '',
		index: 1
	},
	year: {
  	type:String,
		default: ''
	},
	code: {
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
    type: [Schema.Types.Mixed],
    default: []
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
	  type: [Number],
	  default: [null],
	  index: 1
  },
  threads: {
  	start: {// 申请时附带的帖子
		  type: [String],
		  default:[]
	  },
	  end: { // 结项时附带的帖子
		  type: [String],
		  default:[]
	  }
  },
  papers: {
	  start: {
		  type: [String],
		  default:[]
	  },
	  end: {
		  type: [String],
		  default:[]
	  }
  },
  account: {
    paymentMethod: {
      type: String,
      default: ''
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
  	chooseType: { // 选择申请方式
  		type: Boolean,
		  default: null
	  },
	  inputApplicantMessages: { // 输入申请人信息
			type: Boolean,
		  default: null
	  },
	  ensureUsersMessages: { // 申请人员确认
  		type: Boolean,
		  default: null
	  },
	  inputProjectMessages: { // 输入项目基本信息
			type: Boolean,
		  default: null
	  },
		inputProjectContent: { // 输入项目具体内容
  		type: Boolean,
			default: null
		},
	  submit: { // 已提交申请
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
    },
	  disabled: { // 被禁
		  type: Boolean,
		  default: false,
		  index: 1
	  },
	  revoked: { // 撤销
  		type: Boolean,
			default: false,
		  index: 1
	  },
	  exceededModifyCount: {
  		type: Boolean,
		  default: false,
		  index: 1
	  }
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
	modifyCount: {
  	type: Number,
		default: 0
	},
  supporter: {
    type: [String],
    default: [],
    index: 1
  },
  objector: {
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
	const applicationUsers = await FundApplicationUserModel.find({applicationFormId: this._id, uid: {$ne: this.uid}}).sort({toc: 1});

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

const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;
