const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const educationSchema = new Schema({
  school: {
    type: String,
    maxlength: [30, '学校长度应小于30'],
    required: true
  },
  major: {
    type: String,
    maxlength: [30, '专业长度应小于30'],
    required: true
  },
  degree: {
    type: String,
    maxlength: [15, '学历长度应小于15'],
    required: true
  },
  graduationDate: {
    type: Date,
    required: true
  },
  id: {
    type: Number,
    required: true
  }
});

const usersPersonalSchema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    default: '',
    match: /.*@.*/
  },
	nationCode: {
		type: String,
		default: '',
		index: 1
	},
  mobile: {
    type: String,
    default:'',
    index: 1
  },
  hashType: {
    type: String,
    // required: true
  },
  lastTry: {
    type: Number,
    default: 0
  },
  password: {
    salt: {
      type: String,
      // required: true
    },
    hash: {
      type: String,
      // required: true
    }
  },
  newMessage: {
    replies: {
      type: Number,
      default: 0
    },
    message: {
      type: Number,
      default: 0
    },
    system: {
      type: Number,
      default: 0
    },
    at: {
      type: Number,
      default: 0
    }
  },
  regIP: {
    type: String,
    default: '0.0.0.0'
  },
  regPort: {
    type: String,
    default: '0'
  },
  tries: {
    type: Number,
    default: 0
  },
	submittedAuth: {
		type: Boolean,
		default: false,
		index: 1
	},
  // 交易地址管理
  /*
  * {
  *   name: String, 收件人姓名
  *   nationCode: Number, 收件人手机国际区号
  *   mobile: Number, 收件人手机号
  *   address: String, 收货地址
  * }
  * */
  addresses: {
    type: [Schema.Types.Mixed],
    default: [],
  },
  // 绑定的支付宝账号信息
  /*
  * {
  *   account: Number, 支付宝账号
  *   name: String, 支付宝真实姓名
  *   time: Date, 绑定日期
  *   default: Boolean 是否为默认账户
  * }
  * */
  alipayAccounts: {
    type: [Schema.Types.Mixed],
    default: []
  },
  // 绑定的银行卡信息
  /*
  * {
  *   bankName: String, 银行名称
  *   account: Number, 银行卡号
  *   name: String, 开户人姓名,
  *   mobile: String,
  *   default: Boolean 是否为默认账户
  * }
  * */
  bankAccounts: {
    type: [Schema.Types.Mixed],
    default: []
  },
  industries: {
	  type: [Schema.Types.Mixed],
	  default: []
    /*type: [
      {
	      industry: {
	        type: Number,
	        required: true
	      },
	      duty: {
	        type: Number,
	        required: true
	      },
	      organization: {
	        type: String,
		      maxlength: [30, '组织信息长度应小于30'],
	        required: true
	      },
	      occupation: {
		      type: String,
		      maxlength: [30, '职业名称长度应小于30'],
		      required: true
	      },
	      timeB: {
	      	type: Date,
		      required: true
	      },
	      timeE: {
	      	type: Date,
		      required: true
	      }
      }
    ],
    default: []*/
  },
  education: {
  	type: [Schema.Types.Mixed],
	  default: []
    /*type: [
      {
	      school: {
	        type: String,
	        maxlength: [30, '学校长度应小于30'],
	        required: true
	      },
	      major: {
	        type: String,
	        maxlength: [30, '专业长度应小于30'],
		      default: ''
	      },
	      degree: {
	        type: Number,
	        required: true
	      },
	      timeB: {
	        type: Date,
	        required: true
	      }
      }
    ],
    default: []*/
  },
	accounts: {
		type: [Schema.Types.Mixed], //type, number
		default: []
	},
  personalInfo: {
	  /*QQ: {
		  type: String,
		  max: [12, 'QQ号码长度小于12'],
		  default: null
	  },
	  wechat: {
		  type: String,
		  max: [15, '微信长度应小于15'],
		  default: null
	  },*/
	  birthDate: {
		  type: Date,
		  default: null
	  },
	  name: {
		  type: String,
		  maxlength: [10, '真实姓名长度应小于10'],
		  default: null
	  },
	  address: {
	  	type: String,
		  maxlength: [100, '地址长度不能超过100'],
		  default: null
	  },
	  location: {
	  	type: String,
		  maxlength: [20, '地区长度不能超过20'],
		  default: null
	  },
	  gender: {
	  	type: String,
		  default: 'men'
	  }
  },
	privacy: {
  	// 0: 完全保密， 1：对我信任的人显示， 2：对学者显示， 3：对已登录用户显示， 4：完全公开
		name: {
			type: Number,
			default: 3
		},
		gender: {
			type: Number,
			default: 4
		},
		birthDate: {
			type: Number,
			default: 3
		},
		location: {
			type: Number,
			default: 3
		},
		address: {
			type: Number,
			default: 1
		},
		education: {
			type: Number,
			default: 3
		},
		industry: {
			type: Number,
			default: 1
		},
		lifePhoto: {
			type: Number,
			default: 3
		},
		certPhoto: {
			type: Number,
			default: 1
		}
	}
},
  {
  	usePushEach: true,
	  toObject: {
		  getters: true,
		  virtuals: true
	  }
});

usersPersonalSchema.virtual('idPhotos')
	.get(function() {
		return this._idPhotos;
	})
	.set(function(p) {
		this._idPhotos = p;
	});

usersPersonalSchema.virtual('lifePhotos')
	.get(function() {
		return this._lifePhotos;
	})
	.set(function(p) {
		this._lifePhotos = p;
	});

usersPersonalSchema.virtual('certsPhotos')
	.get(function() {
		return this._certsPhotos;
	})
	.set(function(p) {
		this._certsPhotos = p;
	});

usersPersonalSchema.virtual('authLevel')
	.get(function() {
		return this._authLevel;
	})
	.set(function(a) {
		this._authLevel = a;
	});

usersPersonalSchema.methods.extendIdPhotos = async function() {
	const PhotoModel = require('./PhotoModel');
	let idCardA = await PhotoModel.findOne({uid: this.uid, type: 'idCardA'}).sort({toc: -1});
	let idCardB = await PhotoModel.findOne({uid: this.uid, type: 'idCardB'}).sort({toc: -1});
	let handheldIdCard = await PhotoModel.findOne({uid: this.uid, type: 'handheldIdCard'}).sort({toc: -1});
	/*if(idCardA && idCardA.status === 'deleted') idCardA = null;
	if(idCardB && idCardB.status === 'deleted') idCardB = null;
	if(handheldIdCard && handheldIdCard.status === 'deleted') handheldIdCard = null;*/
	return this.idPhotos = {
		idCardB,
		idCardA,
		handheldIdCard
	}
};

// 获取身份认证等级 
usersPersonalSchema.methods.getAuthLevel = async function() {
	if(!this.mobile) return 0;
	const {idCardA, idCardB, handheldIdCard} = await this.extendIdPhotos();
	if(!(idCardA && idCardA.status === 'passed' && idCardB && idCardB.status === 'passed')) return 1;
	if(!(handheldIdCard && handheldIdCard.status === 'passed')) return 2;
	return 3;
};

usersPersonalSchema.methods.extendLifePhotos = async function() {
	const PhotoModel = require('./PhotoModel');
	const lifePhotos = await PhotoModel.find({uid: this.uid, type: 'life', status: {$ne: 'deleted'}}).sort({toc: -1});
	return this.lifePhotos = lifePhotos;
};

usersPersonalSchema.methods.extendCertsPhotos = async function() {
	const PhotoModel = require('./PhotoModel');
	const certsPhotos = await PhotoModel.find({uid: this.uid, type: 'cert', status: {$ne: 'deleted'}}).sort({toc: -1});
	return this.certsPhotos = certsPhotos;
};

usersPersonalSchema.methods.increasePsnl = async function(type, number) {
  const counterType = "newMessage." + type;
  if(number === undefined) {
    const attrObj = {};
    attrObj[counterType] = 0;
    return await this.update(attrObj);
  }
  const attrObj = {};
  attrObj[counterType] = number;
  return await this.update({$inc: attrObj});
};
/* 
  通过uid找查询用户的隐私信息
  @author pengxiguaa 2019/3/7
*/
usersPersonalSchema.statics.findUsersPersonalById = async (uid) => {
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const personal = await UsersPersonalModel.findOne({uid});
  if(!personal) throwErr(404, `未找到ID为【${uid}】的用户隐私信息`);
  return personal;
};
usersPersonalSchema.statics.findById = async (uid) => {
  const UsersPersonalModel = mongoose.model("usersPersonal");
  const usersPersonal = await UsersPersonalModel.findOne({uid});
  if(!usersPersonal) throwErr(404, `未找到ID为${uid}的用户信息`);
  return usersPersonal
};

/*
* 验证密码是否正确
* @param {String} passwordString 用户输入的密码
* @author pengxiguaa 2019-4-10
* */
usersPersonalSchema.methods.ensurePassword = async function(passwordString) {
  const {
    encryptInMD5WithSalt,
    encryptInSHA256HMACWithSalt
  } = require("../tools/encryption");
  const {password, hashType} = this;
  const {hash, salt} = password;
  switch(hashType) {
    case 'pw9':
      if(encryptInMD5WithSalt(passwordString, salt) !== hash) {
        throwErr(400, '密码错误, 请重新输入');
      }
      break;
    case 'sha256HMAC':
      if(encryptInSHA256HMACWithSalt(passwordString, salt) !== hash) {
        throwErr(400, '密码错误, 请重新输入');
      }
      break;
    default: throwErr(400, '未知的密码加密类型');
  }
};


module.exports = mongoose.model('usersPersonal', usersPersonalSchema, 'usersPersonal');
