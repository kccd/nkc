const settings = require('../settings');
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
		required: true,
		maxlength: [200, '备注字数不能大于200']
	},
	abstract: {// 摘要
		type: String,
		required: true,
		maxlength: [10, '摘要字数不能大于10']
	},
	verify: {
		type: Boolean,
		default: true,
		index: 1
	},
	error: {
		type: String,
		default: null,
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
	const q = {};
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

const FundBillModel = mongoose.model('fundBills', fundBillSchema);
module.exports = FundBillModel;