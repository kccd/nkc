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
roleSchema.statics.extendRole = async (_id) => {
  const role = {_id};
  role.displayName = await redisClient.getAsync(`role:${_id}:displayName`);
  role.operationsId = await redisClient.smembersAsync(`role:${_id}:operationsId`);
  role.modifyPostTimeLimit = await redisClient.getAsync(`role:${_id}:modifyPostTimeLimit`);
  role.modifyPostTimeLimit = Number(role.modifyPostTimeLimit || 0);
  return role;
};
const RoleModel = mongoose.model('roles', roleSchema);
module.exports = RoleModel;