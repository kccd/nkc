const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const secretBehaviorSchema = new Schema({
	operationId: {
		type: String,
		index: 1
	},
	type: {
		type: String,
		index: 1,
		//enum: ['bindMobile', 'bindEmail', 'changeMobile', 'changeEmail', 'changeUsername', 'changePassword']
	},
	uid: {
		type: String,
		required: true,
		index: 1
	},
	ip: {
		type: String,
		required: true,
		index: 1
	},
	port: {
		type: String,
		required: true
	},

	//-- bindMobile --
	mobile: {
		type: String,
		index: 1
	},
	nationCode: {
		type: String,
		index: 1
	},

	//-- bindEmail --
	email: {
		type: String,
		index: 1
	},

	//-- changeMobile --
	oldMobile: {
		type: String,
		index: 1
	},
	oldNationCode: {
		type: String,
		index: 1
	},
	newMobile: {
		type: String,
		index: 1
	},
	newNationCode: {
		type: String,
		index: 1
	},

	//-- changeEmail --
	oldEmail: {
		type: String,
		index: 1
	},
	newEmail: {
		type: String,
		index: 1
	},

	//-- changeUsername --
	oldUsername: {
		type: String,
		index: 1
	},
	oldUsernameLowerCase: {
		type: String,
		index: 1
	},
	newUsername: {
		type: String,
		index: 1
	},
	newUsernameLowerCase: {
		type: String,
		index: 1
	},

  //-- changePassword
	oldHashType: String,
	oldHash: String,
	oldSalt: String,
	newHashType: String,
	newHash: String,
	newSalt: String,

	// 个人简介
	oldDescription: String,
	newDescription: String,

	// 文章签名
	oldPostSign: String,
	newPostSign: String,

	// 头像
	oldAvatar: String,
	newAvatar: String,

	// 背景
	oldBanner: String,
	newBanner: String,

	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},

	tlm: {
		type: Date,
		index: 1
	}
}, {
	collection: 'secretBehaviors'
});

secretBehaviorSchema.pre('save', function(next) {
	if(!this.tlm) {
		this.tlm = this.toc;
	}
	next();
});

secretBehaviorSchema.methods.extendUser = async function() {
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

secretBehaviorSchema.methods.extendOperationName = async function() {
	const OperationModel = mongoose.model("operations");
	let operationData;
	if(this.operationId){
		const o = await OperationModel.findOne({_id: this.operationId});
		if(o){
			operationData = o;
		}
	}else if(this.type){
		const o = await OperationModel.findOne({_id: this.type});
		if(o){
			operationData = o;
		}
	}
	return this.operationData = operationData
};

const SecretBehaviorModel = mongoose.model('secretBehaviors', secretBehaviorSchema);
module.exports = SecretBehaviorModel;
