const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const documentSchema = new Schema({
	_id: Number,
	applicationFormId: { // 基金
		type: Number,
		default: null,
		index: 1
	},
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	tlm: {
		type: Date
	},
	type: {
		// project, comment, userInfoAudit, projectAudit, moneyAudit, adminAudit, report, vote
		type: String,
		required: true,
		index: 1
	},
	uid: {
		type: String,
		required: true,
		index: 1
	},
	support: {
		type: Boolean,
		default: null,
		index: 1
	},
	l: {//pwbb
		type: String,
		default: 'pwbb'
	},
	t: {
		type: String,
		default: null
	},
	c: {
		type: String,
		default: null,
		maxlength: [20000, '字数不能超过2000万字。']
	},
	disabled: {
		type: Boolean,
		default: false,
		index: 1
	},
	reply: {
		type: Number,
		default: null,
		index: 1
	}
}, {
	collection: 'fundDocuments',
	toObject: {
		getters: true,
		virtuals: true
	}
});

documentSchema.virtual('user')
	.get(function() {
		return this._user;
	})
	.set(function(user) {
		this._user = user
	});

documentSchema.pre('save', function(next) {
  try {
		if (!this.tlm) this.tlm = this.toc;
  	return next()
	} catch(e) {
  	return next(e)
	}
});

documentSchema.methods.extendUser = async function() {
	const UserModel = require('./UserModel');
	const user = await UserModel.findOnly({uid: this.uid});
	return this.user = user;
};

const FundDocumentModel = mongoose.model('fundDocuments', documentSchema);
module.exports = FundDocumentModel;