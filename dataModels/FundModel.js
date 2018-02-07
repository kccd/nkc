const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundSchema = new Schema({
  _id: String,
  toc: {
    type: Date,
    default: Date.now,
    index: 1 
  },
  tlm: {
    type: Date,
    index: 1
  },
  name: {
    type: String,
    default: '科创基金',
    index: 1
  },
	image: {
  	type: Number,
		default: null,
		index: 1
	},
	color: {
		type: String,
		default: '#7f9eb2'
	},
	money: {
  	initial: {
  		type: Number,
		  required: true,
		  index: 1
	  },
		fixed: {
  		type: Number,
			default: null,
			index: 1
		},
		max: {
			type: Number,
			default: null,
			index: 1
		}
	},
  description: {
    brief: {
    	type: String,
	    required: true
    },
	  detailed: {
    	type: String,
		  required: true,
		  index: 1
	  }
  },
	display: {
    type: Boolean,
    default: true,
		index: 1
  },
	canApply: {
		type: Boolean,
		default: true,
		index: 1
	},
	//设为历史基金
	history: {
		type: Boolean,
		default: false,
		index: 1
	},
	disabled: {
  	type: Boolean,
		default: false,
		index: 1
	},
  censor: {
    certs: {
      type: [String],
      default: []
    },
	  appointed: {
    	type: [String],
		  default: [],
		  index: 1
	  }
  },
	thread: {
		count: {
			type: Number,
			default: 0
		},
	},
	paper: {
		passed: {
			type: Boolean,
			default: false
		},
		count: {
			type: Number,
			default: 0
		}
	},
  applicant: {
    userLevel: {
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
    timeToRegister: {
      type: Number,
      default: 0
    },
	  authLevel: {
    	type: Number,
		  default: 1
	  }
  },
	member: {
		authLevel: {
			type: Number,
			default: 1
		}
	},
	applicationMethod: {
  	personal: {
  		type: Boolean,
		  default: null,
		  index: 1
	  },
		team: {
  		type: Boolean,
			default: null,
			index: 1
		}
	},
	applicationCountLimit: { // 年申请次数限制
		type: Number,
		default: 2
	},
	supportCount: {
		type: Number,
		default: 0
	},
  timeOfPublicity: {
    type: Number,
    default: 0
  },
  modifyCount: {
    type: Number,
    default: 0
  },
	conflict: {
  	self: {
  		type: Boolean,
		  default: false
	  },
		other: {
  		type: Boolean,
			default: false
		}
  	// all: 与所有conflict=all的互斥,
		// self: 仅仅与自己互斥,
		// null: 不存在互斥
		// type: String,
		// required: true,
		// index: 1
	}
}, {
	toObject: {
		getters: true,
		virtuals: true
	}
});


fundSchema.pre('save', function(next){
  if(!this.tlm) this.tlm= this.toc;
  next();
});

fundSchema.methods.ensureUserPermission = async function(user) {
	const UsersPersonalModel = require('./UsersPersonalModel');
	const userPersonal = await UsersPersonalModel.findOnly({uid: user.uid});
	const userAuthLevel = await userPersonal.getAuthLevel();
	const {authLevel, userLevel, postCount, threadCount, timeToRegister} = this.applicant;
	// if(user.userLevel < userLevel) throw '账号等级未满足条件';
	if(user.postCount < postCount) throw '回帖量未满足条件';
	if(user.threadCount < threadCount) throw '发帖量未满足条件';
	if(timeToRegister > Math.ceil((Date.now() - user.toc)/(1000*60*60*24))) throw '注册时间未满足条件';
	if(authLevel > userAuthLevel) throw '身份认证等级未满足最低要求';
};

fundSchema.methods.getConflictingByUser = async function(user) {
	const FundApplicationFormModel = require('./FundApplicationFormModel');
	const {self, other} = this.conflict;
	const q = {
		uid: user.uid,
		disabled: false,
		useless: null,
		'status.completed': {$ne: true}
	};
	// 与自己冲突
	if(self) {
		q.fundId = this._id;
		const selfCount = await FundApplicationFormModel.count(q);
		if(selfCount !== 0) return '您之前申请的该基金项目尚未完成，请完成后再申请。';
	}
	//与其他基金冲突
	if(other) {
		q['conflict.other'] = true;
		const selfCount = await FundApplicationFormModel.count(q);
		if(selfCount !== 0) return '您之前申请的与该基金冲突的基金项目尚未完成 ，请完成后再申请。';
	}
	//年申请次数限制
	const year = (new Date()).getFullYear();
	const count = await FundApplicationFormModel.count({
		uid: user.uid,
		fundId: this._id,
		year,
		useless: {$ne: 'delete'}
	});
	if(count >= this.applicationCountLimit) return '今年您申请该基金的次数已超过限制，欢迎明年再次申请！'
};

const FundModel = mongoose.model('funds', fundSchema);
module.exports = FundModel;