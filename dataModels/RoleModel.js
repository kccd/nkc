const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const roleSchema = new Schema({
	_id: String,
	defaultRole: {
		type: Boolean,
		default: false,
		index: 1
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
	abbr: {
		type: String,
		unique: true,
		required: true,
		maxlength: [4, '简称不能超过4个字']
	},
	color: {
		type: String,
		default: '#aaaaaa'
	},
	modifyPostTimeLimit: {
		type: Number,
		default: 0,
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
	if(this._id === 'default') {
		q.certs = {$ne: 'banned'};
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
	if(this._id === 'default') {
		q.certs = {$ne: 'banned'};
	} else {
		q.certs = this._id;
	}
	return await UserModel.find(q).sort({toc: -1}).skip(start).limit(perpage);
};

const RoleModel = mongoose.model('roles', roleSchema);
module.exports = RoleModel;