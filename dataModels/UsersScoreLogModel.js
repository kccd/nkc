const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const usersScoreLogSchema = new Schema({
	uid: {
		type: String,
		default: '',
		index: 1
	},
	type: {
		type: String,
		required: true,
		index: 1
	},
	targetUid: {
		type: String,
		default: '',
		index: 1
	},
	change: {
		type: Number,
		default: 0,
		index: 1
	},
	targetChange: {
		type: Number,
		default: 0,
		index: 1
	},
	operationId: {
		type: String,
		required: true,
		index: 1
	},
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	tid: {
		type: String,
		default: '',
		index: 1
	},
	fid: {
		type: String,
		default: '',
		index: 1
	},
	pid: {
		type: String,
		default: '',
		index: 1
	},
	description: {
		type: String,
		default: ''
	}
}, {
	collection: 'usersScoreLogs'
});

usersScoreLogSchema.virtual('user')
	.get(function() {
		return this._user;
	})
	.set(function(user) {
		this._user = user;
	});
usersScoreLogSchema.virtual('targetUser')
	.get(function() {
		return this._targetUser;
	})
	.set(function(targetUser) {
		this._targetUser = targetUser;
	});
usersScoreLogSchema.virtual('operation')
	.get(function() {
		return this._operation;
	})
	.set(function(operation) {
		this._operation = operation;
	});

usersScoreLogSchema.methods.extendUser = async function() {
	const UserModel = mongoose.model('users');
	let user;
	if(this.uid) {
		const u = await UserModel.findOne({uid: this.uid});
		if(u) {
			user = u;
		}
	}
	return this.user = user;
};

usersScoreLogSchema.methods.extendTargetUser = async function() {
	const UserModel = mongoose.model('users');
	let targetUser;
	if(this.targetUid) {
		const u = await UserModel.findOne({uid: this.targetUid});
		if(u) {
			targetUser = u;
		}
	}
	return this.targetUser = targetUser;
};


usersScoreLogSchema.methods.extendOperation = async function() {
	const OperationModel = mongoose.model('operations');
	let operation;
	if(this.operationId) {
		const o = await OperationModel.findOne({_id: this.operationId});
		if(o) {
			operation = o;
		}
	}
	return this.operation = operation;
};


const UsersScoreLogModel = mongoose.model('usersScoreLogs', usersScoreLogSchema);

module.exports = UsersScoreLogModel;
