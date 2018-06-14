const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const infoBehaviorSchema = new Schema({
	toc: {
		type: Date,
		index: 1,
		default: Date.now()
	},
	pid: {
		type: String,
		index: 1,
		default: ''
	},
	fid: {
		type: String,
		index: 1,
		default: ''
	},
	tid: {
		type: String,
		index: 1,
		default: ''
	},
	operationId: {
		type: String,
		required: true,
		index: 1,
	},
	uid: {
		type: String,
		default: '',
		index: 1
	},
	ip: {
		type: String,
		default: '',
		index: 1
	},
	port: {
		type: String,
		default: ''
	}
}, {
	collection: 'infoBehaviors'
});

infoBehaviorSchema.virtual('user')
	.get(function() {
		return this._user;
	})
	.set(function(user) {
		this._user = user;
	});

infoBehaviorSchema.virtual('post')
	.get(function() {
		return this._post;
	})
	.set(function(post) {
		this._post = post;
	});

infoBehaviorSchema.virtual('operation')
	.get(function() {
		return this._operation;
	})
	.set(function(operation) {
		this._operation = operation;
	});


infoBehaviorSchema.pre('save', function(next) {
	if(!this.tlm) {
		this.tlm = this.toc;
	}
	next();
});

infoBehaviorSchema.methods.extendPost = async function() {
	const PostModel = mongoose.model('posts');
	let post;
	if(this.pid) {
		const p = await PostModel.findOne({pid: this.pid});
		if(p) {
			post = p;
		}
	}
	return this.post = post;
};

infoBehaviorSchema.methods.extendUser = async function() {
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


infoBehaviorSchema.methods.extendOperation = async function() {
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


const InfoBehaviorModel = mongoose.model('infoBehaviors', infoBehaviorSchema);
module.exports = InfoBehaviorModel;
