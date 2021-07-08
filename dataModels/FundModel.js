const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundSchema = new Schema({
  // 基金编号
  _id: String,
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1 
  },
  // 最后操作时间
  tlm: {
    type: Date,
    index: 1
  },
  // 基金名称
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 基金头像
  avatar: {
    type: String,
    default: '',
  },
  // 基金背景
  banner: {
    type: String,
    default: '',
  },
  /*// 基金图片
	image: {
    // 小图
  	logo: {
		  type: String,
		  default: '',
		  index: 1
	  },
    // 大图
		banner: {
			type: String,
			default: '',
			index: 1
		}
	},*/
  // 颜色
	color: {
		type: String,
		default: '#7f9eb2'
	},
  // 基金金额
	money: {
    // 是否为固定金额
    fixed: {
      type: Boolean,
      default: false,
    },
    // 固定金额时此字段表示固定的金额值
    // 非固定金额时此字段表示允许金额的最大值
    value: {
      type: Number,
      default: 0
    }
	},
  // 介绍相关
  description: {
    // 基金简介
    brief: {
    	type: String,
	    required: true,
	    maxlength: [100, '基金简介字数不能大于100']
    },
    // 基金说明
	  detailed: {
    	type: String,
		  required: true
	  },
    // 基金协议
	  terms: {
    	type: String,
		  required: true
	  }
  },
  //
  reminder: {
    inputUserInfo: {
      type: String,
      default: ""
    },
    inputProject: {
      type: String,
      default: ""
    }
  },
  // 是否基金显示入口
	display: {
    type: Boolean,
    default: true,
		index: 1
  },
  // 是否允许申请
	canApply: {
		type: Boolean,
		default: true,
		index: 1
	},
  // 审核方式 person: 人工审核, system: 系统审核
	auditType: {
		type: String, // person, system
		default: 'person',
		index: 1
	},
	// 是否被设为了历史基金
	history: {
		type: Boolean,
		default: false,
		index: 1
	},
  // 是否被屏蔽
	disabled: {
  	type: Boolean,
		default: false,
		index: 1
	},
	//检查员
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
	//评论人员
	commentator: {
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
	//投票人员
	voter: {
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
	//管理员
	admin: {
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
	//财务
	financialStaff: {
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
	//专家
	expert: {
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
  // 申请时需附带的文章
	thread: {
    // 文章最少篇数
		count: {
			type: Number,
			default: 0
		},
	},
  // 申请时需附带的论文数（暂无论文系统，此字段未使用）
	paper: {
    // 论文是否通过
		passed: {
			type: Boolean,
			default: false
		},
    // 论文最少篇数
		count: {
			type: Number,
			default: 0
		}
	},
  // 与申请人相关的设置
  applicant: {
    // 申请人最小用户等级
    userLevel: {
      type: Number,
      default: 0
    },
    // 最小回复数
    postCount: {
      type: Number,
      default: 0
    },
    // 最小文章数
    threadCount: {
      type: Number,
      default: 0
    },
    // 最小注册天数
    timeToRegister: {
      type: Number,
      default: 0
    },
    // 申请人最小身份认证等级
	  authLevel: {
    	type: Number,
		  default: 1
	  }
  },
  // 组员设置
	member: {
    // 组员最小身份认证等级
		authLevel: {
			type: Number,
			default: 1
		}
	},
  // 申请方式
  applicantType: {
    type: [String],
    default: ['personal', 'team'], // personal: 个人申请, team: 团队申请
  },
  /* 申请方式（此字段已废弃）
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
	},*/
	detailedProject: {// 详细的项目内容
		type: Boolean,
		default: true
	},
	applicationCountLimit: { // 年申请次数限制
		type: Number,
		default: 10
	},
  // 好友支持数，满足之后才能进入审核流程
	supportCount: {
		type: Number,
		default: 0
	},
  // 示众天数 暂时未启用
  timeOfPublicity: {
    type: Number,
    default: 0
  },
  // 允许修改的最大次数
  modifyCount: {
    type: Number,
    default: 5
  },
  // 基金互斥相关
	conflict: {
    // 是否与自己互斥
    // 如果此字段为 true，且用户申请的此基金尚未结题，则用户不能再申请当前基金
  	self: {
  		type: Boolean,
		  default: false
	  },
    // 是否与其他互斥
    // 如果此字段为 true，且用户申请了此字段也为 true 的其他基金并且尚未结题，则用户不能再申请当前基金
		other: {
  		type: Boolean,
			default: false
		}
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
	const FundBillModel = require('./FundBillModel');
	const userPersonal = await UsersPersonalModel.findOnly({uid: user.uid});
	const userAuthLevel = await userPersonal.getAuthLevel();
	const {authLevel, userLevel, postCount, threadCount, timeToRegister} = this.applicant;
	if(user.grade._id < userLevel) throw '账号等级未满足条件';
	if((user.postCount - user.disabledPostsCount) < postCount) throw '回帖量未满足条件';
	if((user.threadCount - user.disabledThreadsCount) < threadCount) throw '发帖量未满足条件';
	if(timeToRegister > Math.ceil((Date.now() - user.toc)/(1000*60*60*24))) throw '注册时间未满足条件';
	if(authLevel > userAuthLevel) throw '身份认证等级未满足最低要求';
	const balance = await FundBillModel.getBalance('fund', this._id);
	if(balance <= 0) throw '基金余额不足。';
};

fundSchema.methods.ensureOperatorPermission = function(type, user) {
	const {expert, censor, financialStaff, admin, commentator, voter} = this;
	const fn = (obj, user) => {
		if(!user) return false;
		for(let cert of obj.certs) {
			if(user.certs.includes(cert)) return true;
		}
		return obj.appointed.includes(user.uid);
	};
	switch (type) {
		case 'expert': return fn(expert, user);
		case 'censor': return fn(censor, user);
		case 'financialStaff': return fn(financialStaff, user);
		case 'admin': return fn(admin, user);
		case 'commentator': return fn(commentator, user);
		case 'voter': return fn(voter, user);
		default: throw '未知的身份类型。';
	}
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
		const selfCount = await FundApplicationFormModel.countDocuments(q);
		if(selfCount !== 0) return '您之前申请的该基金项目尚未完成，请完成后再申请。';
	}
	//与其他基金冲突
	if(other) {
		q['conflict.other'] = true;
		const selfCount = await FundApplicationFormModel.countDocuments(q);
		if(selfCount !== 0) return '您之前申请的与该基金冲突的基金项目尚未完成 ，请完成后再申请。';
	}
	//年申请次数限制
	const year = (new Date()).getFullYear();
	const count = await FundApplicationFormModel.countDocuments({
		uid: user.uid,
		fundId: this._id,
		year,
		useless: {$ne: 'delete'}
	});
	if(count >= this.applicationCountLimit) return '今年您申请该基金的次数已超过限制，欢迎明年再次申请！'
};

const FundModel = mongoose.model('funds', fundSchema);
module.exports = FundModel;