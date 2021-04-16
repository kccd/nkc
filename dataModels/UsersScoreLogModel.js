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
	},
	ip: {
		type: String,
		default: ''
	},
	port: {
		type: Number,
		default: null
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
usersScoreLogSchema.virtual('post')
	.get(function() {
		return this._post;
	})
	.set(function(post) {
		this._post = post;
	});
usersScoreLogSchema.virtual('page')
	.get(function() {
		return this._page;
	})
	.set(function(page) {
		this._page = page;
	});
usersScoreLogSchema.virtual('thread')
	.get(function() {
		return this._thread;
	})
	.set(function(thread) {
		this._thread = thread;
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

usersScoreLogSchema.methods.extendThread = async function() {
	const ThreadModel = mongoose.model('threads');
	let thread;
	if(this.tid) {
		const t = await ThreadModel.findOne({tid: this.tid});
		if(t) {
			thread = t;
		}
	}
	return this.thread = thread;
};

usersScoreLogSchema.methods.extendPost = async function() {
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
	const TypesOfScoreChange = mongoose.model('typesOfScoreChange');
	let operation;
	if(this.operationId) {
		const o = await TypesOfScoreChange.findOne({_id: this.operationId});
		if(o) {
			operation = o;
		}
	}
	return this.operation = operation;
};

usersScoreLogSchema.statics.insertLog = async (options) => {
  const UsersScoreLogModel = mongoose.model('usersScoreLogs');
  const {user, type, typeIdOfScoreChange, port, ip, fid, pid, tid, description} = options;
  if(!user) return;
  if(type === 'score') {
    let {key, change} = options;
    if(!change && change !== 0) change = 1;
    const q = {};
    q[key] = change;
    const log = UsersScoreLogModel({
      uid: user.uid,
      type: 'score',
      change,
      operationId: typeIdOfScoreChange,
      description,
      port,
      ip,
      pid,
      tid,
      fid
    });
    await log.save();
    await user.updateOne({$inc: q});
    user[key] += change;
    await user.calculateScore();
  }
	/*const UserModel = mongoose.model('users');
	const TypeOfScoreChange = mongoose.model('typesOfScoreChange');
	const SettingModel = mongoose.model('settings');
	const UsersScoreLogModel = mongoose.model('usersScoreLogs');
	const {today} = require('../nkcModules/apiFunction');
	const {user, type, typeIdOfScoreChange, port, ip, fid, pid, tid, description} = options;
	const typeOfScoreChange = await TypeOfScoreChange.findOnly({_id: typeIdOfScoreChange});
	if(!user) return;
	if(type === 'kcb') {
		const kcbSettings = await SettingModel.findOnly({type: 'kcb'});
		const targetUser = await UserModel.findOnly({uid: kcbSettings.defaultUid});
		const {change, count} = typeOfScoreChange;
		if(count !== -1) {
			const userLogCount = await UsersScoreLogModel.countDocuments({type: 'kcb', uid: user.uid, operationId: typeIdOfScoreChange, toc: {$gt: today()}});
			if(count <= userLogCount) return;
		}
		const log = UsersScoreLogModel({
			uid: user.uid,
			type: 'kcb',
			targetUid: targetUser.uid,
			change,
			targetChange: -1*change,
			operationId: typeIdOfScoreChange,
			description,
			port,
			ip,
			pid,
			tid,
			fid
		});
		await user.updateOne({$inc: {kcb: change}});
		user.kcb += change;
		await targetUser.updateOne({$inc: {kcb: -1*change}});
		targetUser.kcb += -1*change;
		await log.save();
	} else if(type === 'score') {
		let {key, change} = options;
		if(!change && change !== 0) change = 1;
		const q = {};
		q[key] = change;
		const log = UsersScoreLogModel({
			uid: user.uid,
			type: 'score',
			change,
			operationId: typeIdOfScoreChange,
			description,
			port,
			ip,
			pid,
			tid,
			fid
		});
		await user.updateOne({$inc: q});
		user[key] += change;
		await user.calculateScore();
		await log.save();
	}*/
};

const UsersScoreLogModel = mongoose.model('usersScoreLogs', usersScoreLogSchema);

module.exports = UsersScoreLogModel;
