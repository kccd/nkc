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
      default: '',
    },
    // 基金说明
	  detailed: {
    	type: String,
      default: '',
	  },
    // 基金协议
	  terms: {
    	type: String,
      default: '',
	  }
  },
  // 申请基金时的相关提示
  reminder: {
	  // 填写申请人信息时的提示
    inputUserInfo: {
      type: String,
      default: ""
    },
    // 填写项目信息时的提示
    inputProject: {
      type: String,
      default: ""
    }
  },
  // 是否基金显示入口
	display: {
    type: Boolean,
    default: false,
		index: 1
  },
  // 是否允许申请
	canApply: {
		type: Boolean,
		default: false,
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
	// 评论人员（暂时无用，由于基金项目内容会生成对应的文章，文章是否能评论由论坛那边决定，与基金无关）
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
	  },
  },
  // 申请时是否需要上传生活照
  necessaryPhoto: {
	  type: Boolean,
    default: true,
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
  // 未通过专家和管理员审核，等待申请人修改的最大时间（超时将会更改申请表的状态为‘超时未修改’）
  // 天
  modifyTime: {
    type: Number,
    default: 7,
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

/*
* 判断用户是否有权申请基金
* @param {String} uid 用户 ID
* @param {String} fundId 基金 ID
* */
fundSchema.statics.ensureUserPermission = async function(userId, fundId) {
  const FundModel = mongoose.model('funds');
  const conditions = await FundModel.getConditionsOfApplication(userId, fundId);
  if(!conditions.status) {
    throwErr(403, conditions.infos.join(', '));
  }
};

/*
* 判断用户是否具有专业上的某个身份
* @param {String} uid 用户 ID
* @return {[String]} 可能的取值有：expert, censor, financialStaff, admin, commentator voter
* */
fundSchema.methods.getUserFundRoles = async function(uid) {
  if(!uid) return [];
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOnly({uid});
  const roles = await user.extendRoles();
  const certs = roles.map(r => r._id);
  const {expert, censor, financialStaff, admin, commentator, voter} = this;
  const fundRolesId = [];
  const defaultFundRoles = {
    expert,
    censor,
    financialStaff,
    admin,
    voter
  };
  for(const roleId in defaultFundRoles) {
    if(!defaultFundRoles.hasOwnProperty(roleId)) continue;
    const role = defaultFundRoles[roleId];
    if(role.appointed.includes(uid)) {
      fundRolesId.push(roleId);
      continue;
    }
    const newCerts = new Set(certs.concat(role.certs));
    if(newCerts.size < role.certs.length + certs.length) {
      fundRolesId.push(roleId);
    }
  }
  return fundRolesId;
}

/*
* 检测用户是否拥有某个基金角色
* @param {String} uid 用户 ID
* @param {String} roleId 基金角色 ID
* @return {Boolean}
* */
fundSchema.methods.isFundRole = async function(uid, roleId) {
  const fundRolesId = await this.getUserFundRoles(uid);
  return fundRolesId.includes(roleId);
}
fundSchema.methods.checkFundRole = async function(uid, roleId) {
  const obj = {
    admin: '基金管理员',
    voter: '基金投票人员',
    expert: '基金专家',
    censor: '基金检查员',
    financialStaff: '基金财务',
  };
  const fundRolesId = await this.getUserFundRoles(uid);
  if(!fundRolesId.includes(roleId)) {
    throwErr(403, `你不是${obj[roleId]}，没有权限执行当前操作`);
  }
}

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

/*
* 判断用户是申请了与当前基金项目冲突的基金申请
* @param {String} userId 用户 UID
* @return {String} 如果存在冲突，则返回冲突的相关说明，否则返回空字符串
* */
fundSchema.methods.getConflictingByUser = async function(userId) {
	const FundApplicationFormModel = mongoose.model('fundApplicationForms');
	const FundApplicationUserModel = mongoose.model('fundApplicationUsers');
	const FundBillModel = mongoose.model('fundBills');
  const FundBlacklistModel = mongoose.model('fundBlacklist');
  if(await FundBlacklistModel.inBlacklist(userId)) {
    return '基金黑名单内的用户不能提交新的申请';
  }
	const {self, other} = this.conflict;
	const q = {
		uid: userId,
		disabled: false,
		useless: null,
		'status.completed': {$ne: true}
	};



	// 与自己冲突
	if(self) {
		q.fundId = this._id;
		const selfCount = await FundApplicationFormModel.countDocuments(q);
		if(selfCount !== 0) return '当前基金下存在尚未结题的申报，请结题之后再提交新的申报';
	}
	//与其他基金冲突
	if(other) {
		q['conflict.other'] = true;
		const selfCount = await FundApplicationFormModel.countDocuments(q);
		if(selfCount !== 0) return '其他基金下存在尚未结题的申报，请结题之后再提交新的申报';
	}
	//年申请次数限制
	const year = (new Date()).getFullYear();
	const count = await FundApplicationFormModel.countDocuments({
		uid: userId,
		fundId: this._id,
		year,
		useless: {$ne: 'delete'}
	});
	if(count >= this.applicationCountLimit) return '你今年申报当前基金的次数已用尽';

  // 是否担任其他团队的组员
  const applicationFormUsers = await FundApplicationUserModel.find({
    uid: userId,
    agree: true,
    removed: false,
  }, {
    applicationFormId: 1,
  });

  const applicationForms = await FundApplicationFormModel.find({uid: {$ne: userId}, _id: {$in: applicationFormUsers.map(a => a.applicationFormId)}});
  for(const a of applicationForms) {
    const status = await a.getStatus();
    if(![1, 5].includes(status.general)) {
      return '尚未结题项目的团队成员不能提交新的申报';
    }
  }

  if(!this.canApply) return '基金暂不接受新的申请';
  if(this.history) return '当前基金已被设为历史基金，不再接受新的申请';

  const balance = await FundBillModel.getBalance('fund', this._id);
  if(balance <= 0) return `基金余额不足`;

	return '';
};

/*
* 获取基金申请条件以及用户的条件
* @param {String} userId 用户 ID
* @param {String} fundId 基金 ID
* @return {Object}
*   @param {[Array]} table 类型，最低要求，用户，是否满足
*   @param {Boolean} status 是否可以申请当前基金项目
*   @param {[String]} 无法申请的原因
* */
fundSchema.statics.getConditionsOfApplication = async (userId, fundId) => {
  const UserModel = mongoose.model('users');
  const FundModel = mongoose.model('funds');
  const fund = await FundModel.findOnly({_id: fundId});
  const info = await fund.getConflictingByUser(userId);
  const user = await UserModel.findOnly({uid: userId});
  const {
    userLevel,
    threadCount,
    postCount,
    timeToRegister,
    authLevel
  } = fund.applicant;
  const userGrade = await user.extendGrade();
  const userAuthLevel = await user.extendAuthLevel();
  const userThreadCount = user.threadCount - user.disabledThreadsCount;
  const userPostCount = user.postCount - user.disabledPostsCount;
  const userTimeToRegister = Math.round((Date.now() - (new Date(user.toc)).getTime()) / (1000 * 60 * 60 * 24));
  const userGradeId = userGrade._id;
  const table = [
    ['用户等级', userLevel, userGradeId, userGradeId >= userLevel],
    ['文章数', threadCount, userThreadCount, userThreadCount >= threadCount],
    ['回复数', postCount, userPostCount, userPostCount >= postCount],
    ['注册时间', timeToRegister, userTimeToRegister, userTimeToRegister >= timeToRegister],
    ['认证等级', authLevel, userAuthLevel, userAuthLevel >= authLevel]
  ];
  const infos = [];
  if(info) infos.push(info);
  for(const t of table) {
    if(!t[3]) {
      infos.push(`${t[0]}未满足要求`);
    }
  }
  return {
    status: infos.length === 0,
    table,
    infos
  };
};

/*
* 更改修改超时的申请表状态
* */
fundSchema.statics.modifyTimeoutApplicationForm = async () => {
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const FundModel = mongoose.model('funds');
  const funds = await FundModel.find({}, {_id: 1, modifyTime: 1});
  const timeCondition = [];
  const statusCondition = [
    {
      'status.projectPassed': false
    },
    {
      'status.adminSupport': false,
    }
  ];
  const now = Date.now();
  for(const f of funds) {
    const {_id, modifyTime} = f;
    // 专业为 _id 且 最后操作时间小于 现在 - 超时时间
    timeCondition.push({
      fundId: _id,
      tlm: {
        $lt: now - modifyTime * 24 * 60 * 60 * 1000
      }
    });
  }

  const match = {
    useless: null,
    $and: [
      {
        $or: statusCondition
      },
      {
        $or: timeCondition
      }
    ]
  };

  const applicationForms = await FundApplicationFormModel.find(match);
  for(const form of applicationForms) {
    await form.setUselessAsTimeout();
  }
};

const FundModel = mongoose.model('funds', fundSchema);
module.exports = FundModel;