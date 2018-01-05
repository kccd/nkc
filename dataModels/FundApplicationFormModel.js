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
  publicity: {
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
  budgetMoney: {
    type: [Schema.Types.Mixed],
    default: []
    /*
    {
      purpose: [String],
      money: [Number]
    }
    */
  },
  projectCycle: {
	  type: [Number],
	  default: [],
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
  project: {
    type: Number,
	  default: null,
	  index: 1
  },
  status: {
  	chooseType: {
  		type: Boolean,
		  default: null
	  },
	  inputApplicantMessages: {
			type: Boolean,
		  default: null
	  },
	  ensureUsersMessages: {
  		type: Boolean,
		  default: null
	  },
	  inputProjectMessages: {
			type: Boolean,
		  default: null
	  },
		inputProjectContent: {
  		type: Boolean,
			default: null
		},
	  submit: {
			type: Boolean,
		  default: null
	  },
    usersSupport: {
      type: Boolean,
      default: null,
      index: 1
    },
	  usersMessagesPassed: {
		  type: Boolean,
		  default: null,
		  index: 1
	  },
    projectPassed: {
      type:Boolean,
      default: null,
      index: 1
    },
    adminAgree: {
      type: Boolean,
      default: null,
      index: 1
    },
    remittance: {
      type: Boolean,
      default: null,
      index: 1
    },
    complete: {
      type: Boolean,
      default: null,
      index: 1
    },
    successful: {
      type: Boolean,
      default: null,
      index: 1
    },
    excellent: {
      type: Boolean,
      default: null,
      index: 1
    },
	  disabled: {
		  type: Boolean,
		  default: false,
		  index: 1
	  },
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

const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;
