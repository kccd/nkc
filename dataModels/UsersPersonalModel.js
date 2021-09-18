const fs = require("fs");
const path = require("path");
const settings = require('../settings');
const folderTools = require("../nkcModules/file");
const mongoose = settings.database;
const Schema = mongoose.Schema;
const ffmpeg = require("../tools/ffmpeg");
const FILE = require("../nkcModules/file")

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
	unverifiedEmail: {
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
	unverifiedMobile: {
    type: String,
    default:'',
    index: 1
	},
  hashType: {
    type: String,
    default: ""
    // required: true
  },
  lastTry: {
    type: Number,
    default: 0
  },
	// 修改密码后刷新
	secret: {
  	type: String,
		required: true
	},
  password: {
    salt: {
      type: String,
      default: ""
      // required: true
    },
    hash: {
      type: String,
      default: ""
      // required: true
    }
  },
  regIP: {
    type: String,
		index: 1,
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
	},
	// 积分缓存
	score1: {
  	type: Number,
		default: 0,
		index: 1,
	},
	score2: {
  	type: Number,
		default: 0,
		index: 1
	},
	score3: {
  	type: Number,
		default: 0,
		index: 1,
	},
	score4: {
  	type: Number,
		default: 0,
		index: 1
	},
	score5: {
  	type: Number,
		default: 0,
		index: 1
	},
	score6: {
  	type: Number,
		default: 0,
		index: 1,
	},
	score7: {
  	type: Number,
		default: 0,
		index:1
	},
	// 最后一次验证手机号的时间(时间戳)
	lastVerifyPhoneNumberTime: {
		type: Date,
		index: 1
	},
	// 需要送审的次数，与后台管理中的审核设置同时作用
	// 这里的审核次数主要用于限制已经审核通过多篇文章的用户
	// 比如用户早已脱离新手审核期（前几篇需审核）但出现违规，规定违规后3篇需审核
	// -1: 全需要审核, 0: 不需要审核, 正整数: 具体多少篇需要审核
	reviewCount: {
  	thread: { // 发表文章
			type: Number,
			default: 0
		},
		post: { // 发表回复
  		type: Number,
			default: 0
		}
	},

	// 认证信息
	authenticate: {
		card: {
			status: {
				type: String,
				default: "unsubmit"
			},
			message: {
			  type: String,
        default: ''
      },
			expiryDate: {
			  type: Date,
        default: null
      },
			attachments: {
			  type: [String],
        default: []
      },
		},
		video: {
			status: {
				type: String,
				default: "unsubmit"
			},
			message: {
			  type: String,
        default: ''
      },
			expiryDate: {
			  type: Date,
        default: null
      },
			code: {
			  type: String,
        default: ''
      },
			attachments: {
			  type: [String],
        default: []
      },
		}
	},
  // 用户动态码
  code: {
    t: { // 上一次更新的时间
      type: Date,
      default: null,
    },
    c: { // 动态码的内容
      type: [String],
      default: []
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
	const UserPersonalModel = mongoose.model("usersPersonal");
	await UserPersonalModel.checkExpiryAuthenticate(this.uid);
	const userPersonal = await UserPersonalModel.findOne({ uid: this.uid });
	if(userPersonal.authenticate.video.status === "passed") {
		return 3;
	}
	if(userPersonal.authenticate.card.status === "passed") {
		return 2;
	}
	if(userPersonal.mobile) return 1;
	return 0;
};

// 根据 photo 表判断用户的认证等级 临时
usersPersonalSchema.methods.getAuthLevelFromPhoto = async function() {
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

/**
 * 判断是否需要进行手机号验证
 * @param {string} uid 用户id
 */
usersPersonalSchema.statics.shouldVerifyPhoneNumber = async function(uid) {
	const SettingModel = mongoose.model("settings");
	const UsersPersonalModel = mongoose.model("usersPersonal");
  const userPersonal = await UsersPersonalModel.findOne({uid}, { lastVerifyPhoneNumberTime: 1 });
	if(!userPersonal) return false;
	const safeSettings = await SettingModel.getSettings("safe");
	const phoneVerify = safeSettings.phoneVerify;
	// 如果需要进行手机号验证，验证是否已经过期
	if(!phoneVerify.enable) return false;
	if(!userPersonal.lastVerifyPhoneNumberTime) return true;
	const lastVerifyPhoneNumberTime = userPersonal.lastVerifyPhoneNumberTime
	const interval = phoneVerify.interval * 60 * 60 * 1000;
	if(Date.now() - lastVerifyPhoneNumberTime.getTime() > interval) {
		// 过期了
		return true;
	}
	return false;
}

/*
* 获取用户的邮箱地址
* @param {String} uid 用户ID
* @return {String || null} 邮箱地址或null
* @author pengxiguaa 2021-1-7
* */
usersPersonalSchema.statics.getUserEmail = async (uid) => {
	const UsersPersonalModel = mongoose.model('usersPersonal');
	const userPersonal = await UsersPersonalModel.findOnly({uid});
	return userPersonal.email || null;
};

/*
* 获取用户的手机号
* @param {String} uid 用户手机
* @return {Object} {nationCode: String, number: String} 国际区号和手机号
* @author pengxiguaa 2021-1-8
* */
usersPersonalSchema.statics.getUserPhoneNumber = async (uid) => {
	const UsersPersonalModel = mongoose.model('usersPersonal');
	const userPersonal = await UsersPersonalModel.findOnly({uid});
	return {
		nationCode: userPersonal.nationCode,
		number: userPersonal.mobile
	};
}
/*
* 获取用户的认证等级
* @param {String} uid 用户ID
* @return {Number} 认证等级
* @author pengxiguaa 2021-1-7
* */
usersPersonalSchema.statics.getUserAuthLevel = async (uid) => {
	const UsersPersonalModel = mongoose.model('usersPersonal');
	const userPersonal = await UsersPersonalModel.findOnly({uid});
	return await userPersonal.getAuthLevel();
}

/*
* 验证用户密码是否正确
* @param {String} uid 用户ID
* @param {String} password 待验证的密码
* @return {Boolean} 密码是否正确
* @author pengxiguaa 2021-1-7
* */
usersPersonalSchema.statics.checkUserPassword = async (uid, password) => {
	const UsersPersonalModel = mongoose.model('usersPersonal');
	const userPersonal = await UsersPersonalModel.findOnly({uid});
	try{
		await userPersonal.ensurePassword(password);
		return true;
	} catch(err) {
		return false;
	}
}

/*
* 修改用的手机号并存记录
* */
usersPersonalSchema.statics.modifyUserPhoneNumber = async (props) => {
	const {
		uid,
		phoneNumber,
		ip,
		port,
	} = props;
	const UsersPersonalModel = mongoose.model('usersPersonal');
	const SecretBehaviorModel= mongoose.model('secretBehaviors');
	const samePhoneNumberUser = await UsersPersonalModel.findOne({
		mobile: phoneNumber.number,
		nationCode: phoneNumber.nationCode
	});
	if(samePhoneNumberUser) throwErr(400, `手机号已被其他用户绑定`);
	const userPersonal = await UsersPersonalModel.findOnly({uid});
	await SecretBehaviorModel({
		type: "modifyMobile",
		uid,
		ip,
		port,
		oldNationCode: userPersonal.nationCode,
		oldMobile: userPersonal.mobile,
		newNationCode: phoneNumber.nationCode,
		newMobile: phoneNumber.number
	}).save();
	await userPersonal.updateOne({
		mobile: phoneNumber.number,
		nationCode: phoneNumber.nationCode
	});
};

/* 
  修改最后验证手机号的时间为当前时间
*/
usersPersonalSchema.statics.modifyVerifyPhoneNumberTime = async (uid) => {
  const UsersPersonalModel = mongoose.model('usersPersonal');
  await UsersPersonalModel.updateOne({uid}, {
    $set: {
      lastVerifyPhoneNumberTime: new Date(),
    }
  });
}

/**
 * 生成身份认证2记录
 */
usersPersonalSchema.methods.generateAuthenticateVerify2 = async function(files) {
	const AttachmentModel = mongoose.model("attachments");
	const [ imageA, imageB ] = files;
	if(!imageA || !imageB) {
		throw new Error("must get A and B surface of IDCard.");
	}
	const aids = await Promise.all(
		[ imageA, imageB ].map(async (file) => {
			return await AttachmentModel.saveVerifiedUpload({
				size: file.size,
				hash: file.hash,
				name: file.name,
				path: file.path,
				uid: this.uid
			})
		})
	);

	await this.updateOne({
		$set: {
			"authenticate.card.attachments": aids,
			"authenticate.card.status": "in_review"
		}
	});
}

/**
 * 生成身份认证3记录
 */
usersPersonalSchema.methods.generateAuthenticateVerify3 = async function(file, code) {
	const AttachmentModel = mongoose.model("attachments");
	if(!file) {
		throw new Error("must get a video file.");
	}
	// if ext = mp4 不做任何处理
	// if ext !== mp4 转格式 
	// nkcModules.file.getFileObjectBy
	const VerifiedUploadModel = mongoose.model("verifiedUpload");
  const _id = await VerifiedUploadModel.getNewId();
  const ext = path.extname(file.name).substring(1);
  const date = new Date();
	// if(ext == "mp4"){
	// 	var newFile = file;
	// }else {
  	const dir = await folderTools.getPath("verifiedUpload", date);
		const targetFilePath = path.resolve(dir, `./${_id}.mp4`);
		await ffmpeg.videoTransMP4(file.path, targetFilePath);
		var newFile = await FILE.getFileObjectByFilePath(targetFilePath);
		console.log(newFile)
	// };
	const aid = await AttachmentModel.saveVerifiedUpload({
		_id,
		size: newFile.size,
		hash: newFile.hash,
		ext: "mp4",
		name: newFile.name,
		path: newFile.path,
		uid: this.uid,
		toc:date,
	});
	await this.updateOne({
		$set: {
			"authenticate.video.attachments": [aid],
			"authenticate.video.code": code,
			"authenticate.video.status": "in_review"
		}
	});
}

/**
 * 改变身份认证2的状态
 * @param {"unsubmit" | "in_review" | "passed" | "fail"} status 状态
 */
usersPersonalSchema.methods.changeVerify2Status = async function(status) {
	const valueList = ["unsubmit", "in_review", "passed", "fail"];
	if(!valueList.includes(status)) {
		throw new Error(`must incoming value of status is one of [${valueList.join(", ")}]`);
	}
	await this.updateOne({
		$set: {
			"authenticate.card.status": status
		}
	});
}

/**
 * 审核通过此用户的身份认证2
 * @param {Date} expiryDate 过期日期
 */
usersPersonalSchema.methods.passVerify2 = async function(expiryDate) {
	await this.changeVerify2Status("passed");
	await this.updateOne({
		$set: {
			"authenticate.card.expiryDate": expiryDate
		}
	});
}

/**
 * 把此用户的身份认证2置为审核不通过状态
 * @param {string} message 给用户看的信息
 */
usersPersonalSchema.methods.rejectVerify2 = async function(message) {
	await this.changeVerify2Status("fail");
	await this.updateOne({
		$set: {
			"authenticate.card.message": message
		}
	});
}

/**
 * 检查并过期认证，并更新状态
 * @param {string} uid user id
 */
usersPersonalSchema.statics.checkExpiryAuthenticate = async function(uid) {
	const UsersPersonalModel = mongoose.model("usersPersonal");
	const userPersonal = await UsersPersonalModel.findOnly({ uid });
	const authenticate = userPersonal.authenticate;
	if(authenticate.video.status === "passed" && authenticate.video.expiryDate.getTime() < Date.now()) {
		await userPersonal.updateOne({
			$set: { "authenticate.video.status": "unsubmit" }
		});
	}
	if(authenticate.card.status === "passed" && authenticate.card.expiryDate.getTime() < Date.now()) {
		await userPersonal.updateOne({
			$set: { "authenticate.card.status": "unsubmit" }
		});
	}
}



/**
 * 改变身份认证3的状态
 * @param {"unsubmit" | "in_review" | "passed" | "fail"} status 状态
 */
 usersPersonalSchema.methods.changeVerify3Status = async function(status) {
	const valueList = ["unsubmit", "in_review", "passed", "fail"];
	if(!valueList.includes(status)) {
		throw new Error(`must incoming value of status is one of [${valueList.join(", ")}]`);
	}
	await this.updateOne({
		$set: {
			"authenticate.video.status": status
		}
	});
}

/**
 * 审核通过此用户的身份认证3
 * @param {Date} expiryDate 过期日期
 */
usersPersonalSchema.methods.passVerify3 = async function(expiryDate) {
	await this.changeVerify3Status("passed");
	await this.updateOne({
		$set: {
			"authenticate.video.expiryDate": expiryDate
		}
	});
}

/**
 * 把此用户的身份认证3置为审核不通过状态
 * @param {string} message 给用户看的信息
 */
usersPersonalSchema.methods.rejectVerify3 = async function(message) {
	await this.changeVerify3Status("fail");
	await this.updateOne({
		$set: {
			"authenticate.video.message": message
		}
	});
}




/*
* 获取上一个动态码
* */

module.exports = mongoose.model('usersPersonal', usersPersonalSchema, 'usersPersonal');
