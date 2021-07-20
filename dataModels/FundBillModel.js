const settings = require('../settings');
const moment = require("moment");
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundBillSchema = new Schema({
	_id: {
		type: String,
		default: Date.now
	},
	from: {
		type: {// user, fund, fundPool
			type: String,
			required: true,
			index: 1
		},
		id: {
			type: String,
			default: '',
			index: 1
		},
		anonymous: {
			type: Boolean,
			default: false
		}
	},
	to: {
		type: {// user, fund, fundPool
			type: String,
			required: true,
			index: 1
		},
		id: {
			type: String,
			default: '',
			index: 1
		},
		anonymous: {
			type: Boolean,
			default: false
		}
	},
	uid: {
		type: String,
		default: '',
		index: 1
	},
	applicationFormId: {
		type: Number,
		default: null,
		index: 1
	},
	money: {
		type: Number,
		required: true
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
	notes: {
		type: String,
    default: '',
	},
	abstract: {// 摘要
		type: String,
		required: true,
		maxlength: [10, '摘要字数不能大于10'],
		index: 1
	},

  // 支付平台 wechatPay、aliPay、''
  paymentType: {
    type: String,
    default: '',
    index: 1
  },
  // 支付平台对应的 ID
  paymentId: {
    type: String,
    default: '',
    index: 1
  },
  // 当前账单是否通过验证，未验证的账单无效
	verify: {
		type: Boolean,
		default: true,
		index: 1
	},
	otherInfo: {
		paymentType: {
			type: String,
			default: ''
		},
		transactionNumber: {
			type: String,
			default: ''
		},
		name: {
			type: String,
			default: ''
		},
		account: {
			type: String,
			default: ''
		},
		error: {
			type: String,
			default: ''
		}
	}
}, {
	collection: 'fundBills',
	toObject: {
		getters: true,
		virtuals: true
	}
});

fundBillSchema.virtual('applicationForm')
	.get(function() {
		return this._applicationForm;
	})
	.set(function(applicationForm) {
		this._applicationForm = applicationForm;
	});

fundBillSchema.virtual('user')
	.get(function() {
		return this._user;
	})
	.set(function(user) {
		this._user = user;
	});

fundBillSchema.virtual('fund')
	.get(function() {
		return this._fund;
	})
	.set(function(fund) {
		this._fund = fund;
	});

fundBillSchema.virtual('balance')
	.get(function() {
		return this._balance;
	})
	.set(function(balance) {
		this._balance = balance;
	});

fundBillSchema.virtual('fromInfo')
	.get(function() {
		return this._fromUser;
	})
	.set(function(fromUser) {
		this._fromUser = fromUser;
	});

fundBillSchema.virtual('toInfo')
	.get(function() {
		return this._toUser;
	})
	.set(function(toUser) {
		this._toUser = toUser;
	});

fundBillSchema.pre('save', function(next) {
	if(!this.tlm) {
		this.tlm = this.toc;
	}
	next();
});

fundBillSchema.methods.extendApplicationForm = async function() {
	if(this.applicationFormId) {
		const FundApplicationFormModel = require('./FundApplicationFormModel');
		const applicationForm = await FundApplicationFormModel.findOnly({_id: this.applicationFormId});
		return this.applicationForm = applicationForm;
	}
};

fundBillSchema.methods.extendFromInfo = async function() {
	const {id, type, anonymous} = this.from;
	const obj = {
		id,
		type,
		anonymous
	};
	if(type === 'fund') {
		const FundModel = require('./FundModel');
		obj.fund = await FundModel.findOnly({_id: id});
	}
	if(type === 'user' && id && !anonymous) {
		const UserModel = require('./UserModel');
		obj.user = await UserModel.findOnly({uid: id});
	}
	return this.fromInfo = obj;
};

fundBillSchema.methods.extendToInfo = async function() {
	const {id, type, anonymous} = this.to;
	const obj = {
		id,
		type,
		anonymous
	};
	if(type === 'fund') {
		const FundModel = require('./FundModel');
		obj.fund = await FundModel.findOnly({_id: id});
	}
	if(type === 'user' && id && !anonymous) {
		const UserModel = require('./UserModel');
		obj.user = await UserModel.findOnly({uid: id});
	}
	return this.toInfo = obj;
};

fundBillSchema.methods.extendUser = async function() {
	if(this.uid) {
		const UserModel = require('./UserModel');
		return this.user = await UserModel.findOnly({uid: this.uid});
	}
};

fundBillSchema.methods.extendFund = async function() {
	let fund;
	if(this.fundId) {
		const FundModel = require('./FundModel');
		fund = await FundModel.findOnly({_id: this.fundId});
	}
	return this.fund = fund;

};

fundBillSchema.statics.getBalance = async function(type, id) {
	const FundBillModel = mongoose.model('fundBills');
	const q = {verify: true};
	if(type === 'fund') {
		q.$or = [
			{
				'from.type': 'fund',
				'from.id': id
			},
			{
				'to.type': 'fund',
				'to.id': id
			}
		];
	} else if(type === 'fundPool') {
		q.$or = [
			{
				'from.type': 'fundPool'
			},
			{
				'to.type': 'fundPool'
			}
		];
	}

	const bills = await FundBillModel.find(q, {_id: 0, from: 1, to: 1});
	let total = 0;
	bills.map(b => {
		if(b.from.type === type) {
			total += b.money*-1;
		} else {
			total += b.money;
		}
	});
	return total;
};

fundBillSchema.statics.getDonationBills = async (count = 12) => {
  const FundBillModel = mongoose.model('fundBills');
  const tools = require('../nkcModules/tools');
  const anonymousInfo = tools.getAnonymousInfo();
  const UserModel = mongoose.model('users');
  const FundModel = mongoose.model('funds');
  const bills = await FundBillModel.find({
    'from.type': 'user',
    abstract: '赞助',
    verify: true
  }, {
    toc: 1,
    from: 1,
    to: 1,
    abstract: 1,
    money: 1
  }).sort({toc: -1}).limit(count);
  const usersId = [];
  const fundsId = [];
  for(const b of bills) {
    usersId.push(b.from.id);
    if(b.to.type === 'fund') {
      fundsId.push(b.to.id);
    }
  }
  const users = await UserModel.find({uid: {$in: usersId}}, {avatar: 1, uid: 1, username: 1});
  const usersObj = {};
  users.map(u => usersObj[u.uid] = u);
  const funds = await FundModel.find({_id: {$in: fundsId}});
  const fundsObj = {};
  funds.map(f => fundsObj[f._id] = f);
  const results = [];
  for(const b of bills) {
    const {from, to} = b;
    let user = {
      username: '',
      uid: '',
      avatarUrl: ''
    };
    let fund = {
      name: '资金池',
      fundId: ''
    };
    if(from.id === '' || from.anonymous) {
      user = anonymousInfo;
    } else {
      const _user = usersObj[from.id];
      if(!_user) continue;
      user = {
        username: _user.username,
        uid: _user.uid,
        avatarUrl: tools.getUrl('userAvatar', _user.avatar)
      };
    }
    if(to.type === 'fund') {
      const _fund = fundsObj[to.id];
      if(!_fund) continue;
      fund = {
        name: _fund.name,
        fundId: _fund._id
      };
    }
    user.money = b.money;
    results.push({
      user,
      fund,
      time: b.toc,
      money: b.money,
    });
  }
  return results;
};

fundBillSchema.statics.getNewId = async () => {
  const redLock = require('../nkcModules/redLock');
  const lock = await redLock.lock(`createFundBillId`, 6000);
  const id = Date.now();
  setTimeout(() => {
    lock.unlock();
  }, 200);
  return id;
}

/*
* 在基金账单中创建赞助账单
* @param {Object} props
*   @parma {Number} money 金额 (元)
*   @param {String} uid 赞助人 ID 游客为 ’‘
*   @param {Boolean} anonymous 是否为匿名赞助
*   @param {String} fundId 赞助给基金项目时的基金项目 ID 或 fundPool
*   @param {String} paymentType 支付平台 wechatPay, aliPay
*   @param {String} paymentId 支付平台对应的记录 ID
* */
fundBillSchema.statics.createDonationBill = async (props) => {
  const FundBillModel = mongoose.model('fundBills');
  const {
    money,
    uid = '',
    anonymous,
    fundId,
    paymentId,
    paymentType,
  } = props;
  const bill = FundBillModel({
    _id: await FundBillModel.getNewId(),
    from: {
      type: 'user',
      id: uid,
      anonymous: !!uid? anonymous: true,
    },
    to: {
      type: fundId === 'fundPool'? 'fundPool': 'fund',
      id: fundId === 'fundPool'? '': fundId,
      anonymous: false,
    },
    uid,
    money,
    abstract: '赞助',
    notes: `赞助 ${money} 元`,
    paymentId,
    paymentType,
    verify: false
  });
  await bill.save();
};


/*
* 更改当前记录为已验证
* */
fundBillSchema.methods.verifyPass = async function() {
  if(this.verify) return;
  this.verify = true;
  await this.save();
};

const FundBillModel = mongoose.model('fundBills', fundBillSchema);
module.exports = FundBillModel;