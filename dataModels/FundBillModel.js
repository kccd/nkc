const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundBillSchema = new Schema({
	_id: String,
	fundId: {
		type: String,
		required: true,
		index: 1
	},
	uid: {
		type: String,
		required: true,
		index: 1
	},
	applicationFormId: {
		type: Number,
		default: null,
		index: 1
	},
	changed: {
		type: Number,
		required: true
	},
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	notes: {
		type: String,
		required: true
	},
	abstract: {// 摘要
		type: String,
		required: true
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

fundBillSchema.methods.extendApplicationForm = async function() {
	if(this.applicationFormId) {
		const FundApplicationFormModel = require('./FundApplicationFormModel');
		const applicationForm = await FundApplicationFormModel.findOnly({_id: this.applicationFormId});
		return this.applicationForm = applicationForm;
	}
};

fundBillSchema.methods.extendUser = async function() {
	const UserModel = require('./UserModel');
	const user = await UserModel.findOnly({uid: this.uid});
	return this.user = user;
};

const FundBillModel = mongoose.model('fundBills', fundBillSchema);
module.exports = FundBillModel;