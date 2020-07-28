const mongoose = require('../settings/database');
const redisClient = require('../settings/redisClient');
const Schema = mongoose.Schema;
const roleSchema = new Schema({
	_id: String,
  type: { // 类型 system: 系统类（无法删除），management: 管理类（只能手动颁发），common: 普通的（可自动颁发）
    type: String,
    required: true,
    index: 1
  },
  hasIcon: { // 是否有图标
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: false
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
	operationsId: {
		type: [String],
		default: [],
		index: 1
	},
	description: {
		type: String,
		maxlength: [512, '介绍不能超过512个字'],
		default: ''
	},
	displayName: {
		type: String,
		unique: true,
		required: true,
		maxlength: [8, '名称不能超过8个字']
  },
	color: {
		type: String,
		default: '#aaaaaa'
	},
	modifyPostTimeLimit: {
		type: Number,
		default: 0,
	},
	// 每天最多能给$个用户发送信息
	messagePersonCountLimit: {
		type: Number,
		default: 0
	},
	// 每天所能发送信息的总条数
	messageCountLimit: {
		type: Number,
		default: 0
	},
	// 每天所能发表的回复数
	postToThreadCountLimit: {
		type: Number,
		default: 0
	},
  // 发表回复间隔分钟数
  postToThreadTimeLimit: {
		type: Number,
		default: 0
  },
  // 发表文章间隔分钟数
  postToForumTimeLimit: {
    type: Number,
    default: 0
  },
	// 每天所能发表的文章数
	postToForumCountLimit: {
		type: Number,
		default: 0
	},
	// 是否是默认证书
	defaultRole: {
		type: Boolean,
		default: false,
	},

  postToForum: {
	  countLimit: {
	    unlimited: {
	      type: Boolean,
        default: true
      },
      num: {
	      type: Number,
        default: 0
      }
    },
    timeLimit: {
      unlimited: {
        type: Boolean,
        default: true
      },
      num: {
        type: Number,
        default: 0
      }
    }
  },
  postToThread: {
	  countLimit: {
      unlimited: {
        type: Boolean,
        default: true
      },
      num: {
        type: Number,
        default: 0
      }
    },
    timeLimit: {
      unlimited: {
        type: Boolean,
        default: true
      },
      num: {
        type: Number,
        default: 0
      }
    }
  }

}, {
	collection: 'roles'
});


roleSchema.virtual('userCount')
	.get(function() {
		return this._userCount;
	})
	.set(function(userCount) {
		this._userCount = userCount;
	});

roleSchema.pre('save', function(next){
	if(!this.tlm) this.tlm = this.toc;
	next();
});


roleSchema.methods.extendUserCount = async function() {
	const UserModel = await mongoose.model('users');
	const q = {};
	if(this._id === 'scholar') {
		q.xsf = {$gt: 0};
	} else if(this._id === 'default') {

	} else {
		q.certs = this._id;
	}
	const count = await UserModel.count(q);
	return this.userCount = count;
};

roleSchema.methods.getUsers = async function(paging) {
	const {start, perpage} = paging;
	const UserModel = mongoose.model('users');
	const q = {};
	if(this._id === 'scholar') {
		q.xsf = {$gt: 0};
	} else if(this._id === 'default') {
	} else {
		q.certs = this._id;
	}
	return await UserModel.find(q).sort({toc: -1}).skip(start).limit(perpage);
};

/*
* 将单个证书对象缓存到redis
* @param {Object} role 证书对象
* @author pengxiguaa 2020/7/28
* */
roleSchema.statics.saveRoleObjToRedis = async (role) => {
	const key = `role:${role._id}`;
	await redisClient.setAsync(key, JSON.stringify(role));
}
/*
* 缓存单个用户证书信息到redis
* @param {String} _id 证书id
* @return {Object} 证书对象
* @author pengxiguaa 2020/7/28
* */
roleSchema.statics.saveRoleToRedis = async (_id) => {
	const RoleModel = mongoose.model('roles');
	const role = await RoleModel.findOne({_id});
	if(!role) throwErr(500, `未知的证书ID _id: ${_id}`);
	await RoleModel.saveRoleObjToRedis(role);
	return role;
};
/*
* 缓存全部用户证书信息到redis
* @return {[Object]} 证书对象组成的数组
* @author pengxiguaa 2020/7/28
* */
roleSchema.statics.saveRolesToRedis = async () => {
	const RoleModel = mongoose.model('roles');
	const roles = await RoleModel.find();
	for(const role of roles) {
		await RoleModel.saveRoleObjToRedis(role);
	}
	const rolesId = roles.map(role => role._id);
	await RoleModel.saveRolesIdToRedis(rolesId);
	return roles;
};
/*
* 缓存全部用户证书的ID到redis
* @param {[String]} rolesId 证书ID组成的数组
* @author pengxiguaa 2020/7/28
* */
roleSchema.statics.saveRolesIdToRedis = async (rolesId) => {
	const key = `roles:keys`;
	await redisClient.setAsync(key, JSON.stringify(rolesId))
	return rolesId;
};
/*
* 从redis获取全部用户证书的ID
* @return {[String]} 证书ID组成的数组
* */
roleSchema.statics.getRolesId = async () => {
	const key = `roles:keys`;
	const rolesIdString = await redisClient.getAsync(key);
	return JSON.parse(rolesIdString);
};
/*
* 从redis获取证书信息
* @param {String} _id 证书ID
* @return {Object} 证书对象
* @author pengxiguaa 2020/7/28
* */
roleSchema.statics.extendRole = async (_id) => {
	const key = `role:${_id}`;
	const RoleModel = mongoose.model('roles');
	const rolesId = await RoleModel.getRolesId();
	if(!rolesId.includes(_id)) return;
	let role = await redisClient.getAsync(key);
	try{
		role = JSON.parse(role);
	} catch(err) {
		const RoleModel = mongoose.model('roles');
		role = await RoleModel.saveRoleToRedis(_id);
	}
	return role;

  /*const role = {_id};
  role.hidden = await redisClient.getAsync(`role:${_id}:hidden`);
  role.hidden = (role.hidden === "true");
  role.displayName = await redisClient.getAsync(`role:${_id}:displayName`);
  role.operationsId = await redisClient.smembersAsync(`role:${_id}:operationsId`);
  role.modifyPostTimeLimit = await redisClient.getAsync(`role:${_id}:modifyPostTimeLimit`);
  role.modifyPostTimeLimit = Number(role.modifyPostTimeLimit || 0);
  return role;*/
};

/*
* 获取所有证书和用户等级ID
* @param {[String]} blacklist 排除的证书
* @return {[Object, ...]} object: {type: 'role', id: String(RoleId), name: String(RoleName)}
* @author pengxiguaa 2020/6/12
* */
roleSchema.statics.getCertList = async (blacklist = []) => {
	blacklist.push('default');
	const RM = mongoose.model("roles");
	const GM = mongoose.model("usersGrades");
	const roles = await RM.find({_id: {$nin: blacklist}}, {_id: 1, displayName: 1}).sort({toc: 1});
	const grades = await GM.find({}, {_id: 1, displayName: 1}).sort({_id: 1});
	const data = [];
	for(const role of roles) {
		data.push({
			type: `role-${role._id}`,
			name: `证书 - ${role.displayName}`
		});
	}
	for(const grade of grades) {
		data.push({
			type: `grade-${grade._id}`,
			name: `等级 - ${grade.displayName}`
		});
	}
	return data;
}

/*
* 后台管理中存在大量与证书和用户等级相关的设置，此方法用于过滤掉存在已被删除的证书或等级的设置
* @param {[Object]} data 待处理的数据，每一条数据都至少包含type字段用于过滤
* 	data: [
*     {
*       type: String, // role-id, grade-id
* 			...
*     }
*   ]
* @param {[String]} blacklist 排除的证书
* @return {[Object]} 同data
* @author pengxiguaa 2020/6/12
* */
roleSchema.statics.filterSettings = async (data = [], blacklist = []) => {
	blacklist.push('default');
	let rolesId = await mongoose.model("roles").find({_id: {$nin: blacklist}}, {_id: 1});
	let gradesId = await mongoose.model('usersGrades').find({}, {_id: 1});
	rolesId = rolesId.map(role => role._id);
	gradesId = gradesId.map(grade => grade._id);
	const _data = [];
	for(const d of data) {
		const [type, id] = d.type.split('-');
		if(
			(type === 'role' && rolesId.includes(id)) ||
			(type === 'grade' && gradesId.includes(Number(id)))
		) _data.push(d);
	}
	return _data;
}

const RoleModel = mongoose.model('roles', roleSchema);
module.exports = RoleModel;
