const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const problemSchema = new Schema({
	_id: Number,
	viewed: {
		type: Boolean,
		default: false,
		index: 1
	},
	resolved: {
		type: Boolean,
		default: false,
		index: 1
	},
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	uid: {
		type: String,
		index: 1
	},
	email: {
		type: String,
		index: 1
	},
	t: {
		type: String,
		required: true,
		maxlength: [25, '标题不能超过25个字'],
	},
	c: {
		type: String,
		maxlength: [2048, '内容不能超过10000个字'],
		required: true
	},
	ip: {
		type: String,
		required: true,
		index: 1
	},
	restorerId: {
		type: String,
		default: '',
		index: 1
	},
	resolveTime: {
		type: Date,
		index: 1
	},
	QQ: {
		type: Number,
		maxlength: [15, 'QQ位数不能超过15位']
	}
}, {
	collection: 'problems'
});

problemSchema.virtual('user')
	.get(function() {
		return this._user;
	})
	.set(function(user) {
		this._user = user;
	});

problemSchema.virtual('restorer')
	.get(function() {
		return this._restorer;
	})
	.set(function(restorer) {
		this._restorer = restorer;
	});

problemSchema.methods.extendUser = async function() {
	const UserModel = mongoose.model('users');
	return this.user = await UserModel.findOne({uid: this.uid});
};

problemSchema.methods.extendRestorer = async function() {
	if(!this.restorerId) return this.restorer = undefined;
	const UserModel = mongoose.model('users');
	return this.restorer = await UserModel.findOne({uid: this.restorerId});
};

problemSchema.statics.ensureSubmitPermission = async function(option) {
	const {ip} = option;
	const {problemCountInOneDay} = require('../settings/problem');
	const {today} = require('../nkcModules/apiFunction');
	const ProblemModel = mongoose.model('problems');
	const count = await ProblemModel.count({ip, toc: {$gt: today()}});
	if(count >= problemCountInOneDay) {
		const error = new Error(`同一IP每天只能报告${problemCountInOneDay}次问题`);
		error.status = 403;
		throw error;
	}
};

const ProblemModel = mongoose.model('problems', problemSchema);
module.exports = ProblemModel;
