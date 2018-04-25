const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const secretBehaviorSchema = new Schema({
	type: {
		type: String,
		required: true,
		index: 1,
		enum: ['bindMobile', 'bindEmail', 'changeMobile', 'changeEmail', 'changeUsername', 'changePassword']
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

const SecretBehaviorModel = mongoose.model('secretBehaviors', secretBehaviorSchema);
module.exports = SecretBehaviorModel;
