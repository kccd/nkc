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
  timeToCreate: {
    type: Date,
    default: Date.now,
    index: 1
  },
  timeOfLastRevise: {
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
    type: Number,
    default: null
  },
  // 延期
  postpone: {
    type: [Number],
    default: [],
    index: 1
  },
	userMessages: {
		name: String,
		idCardNumber: String,
		mobile: String,
		description: String,
		idCardA: Number,
		idCardB: Number,
		handheldIdCard: Number,
		life: [String],
		certs: [Number]
	},
  threads: {
    type: [String],
    default:[]
  },
  papers: {
    type: [String],
    default: []
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
    title: {
      type: String,
      index: 1
    },
    aim: {
      type: String,
    },
    content: {
      type: String,
      index: 1
    },
    supplementary: {
      type: [String],
      default: [],
      index: 1
    }
  },
  status: {
  	chooseType: {
  		type: Boolean,
		  default: false
	  },
	  inputUserMessages: {
			type: Boolean,
		  default: false
	  },
	  ensureUsersMessages: {
  		type: Boolean,
		  default: false
	  },
	  inputProjectMessages: {
			type: Boolean,
		  default: false
	  },
		inputProjectContent: {
  		type: Boolean,
			default: false
		},
	  submit: {
			type: Boolean,
		  default: false
	  },
    usersSupport: {
      type: Boolean,
      default: null,
      index: 1
    },
    projectPassed: {
      type:Boolean,
      default: null,
      index: 1
    },
    usersMessagesPassed: {
      type: Boolean,
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
    }
  },
  projectLock: {
    status: {
      type: Number,
      default: 0, // 0未提交， 1已提交， 2正在审批， 3审核完成
      index: 1
      /*submitted: {
        type: Boolean,
        default: false
      },
      beingReviewed: {
        type: Boolean,
        default: false
      },
      complete: {
        type: Boolean,
        default: false
      }*/
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
    },
    reason: {
      type: String,
      default: ''
    }
  },
  usersMessagesLock: {
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
    },
    reason: {
      type: String,
      default: ''
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
  },
  result: {
  	successful: {
  		type: Boolean,
		  default: null
	  },
	  reason: {
		  type: String,
		  default: ''
	  },
    thread: {
      type: [String],
      default: [],
      index: 1
    },
    paper: {
      type: [String],
      default: [],
      index: 1
    }
  },
  comments: {
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
		this._fund = fund
	});

fundApplicationFormSchema.virtual('members')
	.get(function() {
		return this._members;
	})
	.set(function(members) {
		this._members = members
	});

const match = (obj) => {
  const {
  	chooseType,
	  inputUsersMessages,
	  ensureUsersMessages,
	  inputProjectMessages,
	  inputProjectContent,
	  submit,
    pStatus,
    uStatus,
    usersSupport,
    projectPassed,
    usersMessagesPassed,
    adminSupport,
    remittance,
    complete,
    successful,
    excellent,
	  inputStatus,
	  resultSuccessful
  } = obj;
  const query = {};
  if(pStatus !== undefined) query['projectLock.status'] = pStatus;
  if(uStatus !== undefined) query['usersMessagesLock.status'] = uStatus;
  if(usersSupport !== undefined) query['status.usersSupport'] = usersSupport;
  if(projectPassed !== undefined) query['status.projectPassed'] = projectPassed;
  if(usersMessagesPassed !== undefined) query['status.usersMessagesPassed'] = usersMessagesPassed;
  if(adminSupport !== undefined) query['status.adminSupport'] = adminSupport;
  if(remittance !== undefined) query['status.remittance'] = remittance;
  if(complete !== undefined) query['status.complete'] = complete;
  if(successful !== undefined) query['status.successful'] = successful;
  if(excellent !== undefined) query['status.excellent'] = excellent;
  if(inputStatus !== undefined) query['status.inputStatus'] = inputStatus;
	if(chooseType !== undefined) query['status.chooseType'] = chooseType;
	if(inputUsersMessages !== undefined) query['status.inputUsersMessages'] = inputUsersMessages;
	if(ensureUsersMessages !== undefined) query['status.ensureUsersMessages'] = ensureUsersMessages;
	if(inputProjectMessages !== undefined) query['status.inputProjectMessages'] = inputProjectMessages;
	if(inputProjectContent !== undefined) query['status.inputProjectContent'] = inputProjectContent;
	if(submit !== undefined) query['status.submit'] = submit;
	if(resultSuccessful !== undefined) query['result.successful'] = resultSuccessful;
  return query;
};

fundApplicationFormSchema.statics.match = match;

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

fundApplicationFormSchema.methods.extendMembers = async function() {
	const FundApplicationUserModel = require('./FundApplicationUserModel');
	const applicationUsers = await FundApplicationUserModel.find({applicationId: this._id}).sort({toc: 1});
	return this.members = applicationUsers;
};

fundApplicationFormSchema.methods.extendFund = async function() {
	const FundModel = require('./FundModel');
	const fund = await FundModel.findOnly({_id: this.fundId});
	return this.fund = fund;
};

const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;
