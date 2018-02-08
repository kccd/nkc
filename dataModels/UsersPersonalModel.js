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
  mobile: {
    type: String,
    default:'',
    index: 1
  },
  hashType: {
    type: String,
    required: true
  },
  lastTry: {
    type: Number,
    default: 0
  },
  password: {
    salt: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
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
  addresses: {
    type: [
      Schema.Types.Mixed
      /*{
      alipay: {
        type: String,
        max: [60, '支付宝帐号长度应小于60'],
        required: true
      },
      address: {
        type: String,
        max: [60, '地址长度应小于60'],
        required: true
      },
      id: {
        type: Number,
        required: true
      }
    }*/],
    default: [],
  },
  industries: {
    type: [
      Schema.Types.Mixed
      ,/*{
      industry: {
        type: String,
        max: [30, '行业长度应小于30'],
        required: true
      },
      duty: {
        type: String,
        max: [30, '职责长度应小于30'],
        required: true
      },
      organization: {
        type: String,
        max: [30, '组织信息长度应小于30'],
        required: true
      },
      id: {
        type: Number,
        required: true
      }
    }*/],
    default: []
  },
  education: {
    type: [
      Schema.Types.Mixed
      /*{
      school: {
        type: String,
        max: [30, '学校长度应小于30'],
        required: true
      },
      major: {
        type: String,
        max: [30, '专业长度应小于30'],
        required: true
      },
      degree: {
        type: String,
        max: [15, '学历长度应小于15'],
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
    }*/],
    default: []
  },
  personalInfo: {
    type: {
      QQ: {
        type: String,
        max: [12, 'QQ号码长度小于12'],
        required: true
      },
      wechat: {
        type: String,
        max: [15, '微信长度应小于15'],
        required: true
      },
      birthday: {
        type: Date,
        required: true
      }
    },
    default: {}
  }
},
  {usePushEach: true});

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
	if(idCardA && idCardA.status === 'deleted') idCardA = null;
	if(idCardB && idCardB.status === 'deleted') idCardB = null;
	if(handheldIdCard && handheldIdCard.status === 'deleted') handheldIdCard = null;
	return this.idPhotos = {
		idCardB,
		idCardA,
		handheldIdCard
	}
};

usersPersonalSchema.methods.getAuthLevel = async function() {
	const {idCardA, idCardB, handheldIdCard} = await this.extendIdPhotos();
	if(!this.mobile) return 0;
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

module.exports = mongoose.model('usersPersonal', usersPersonalSchema, 'usersPersonal');
