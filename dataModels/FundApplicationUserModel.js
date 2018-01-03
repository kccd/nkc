const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationUserSchema = new Schema({
	timeToCreate: {
		type: Date,
		default: Date.now,
		index: 1
	},
	uid: {
		type: String,
		required: true,
		index: 1
	},
	username: {
		type: String,
		required: true,
		index: 1
	},
	agree: {
		type: Boolean,
		default: null,
		index: 1
	},
	applicationId: {
		type: Number,
		required: true,
		index: 1
	},
	info: {
		name: String,
		idCardNumber: String,
		mobile: String,
		description: String,
		idCardA: Number,
		idCardB: Number,
		handheldIdCard: Number,
		life: [String],
		certs: [Number]
	}
}, {collection: 'fundApplicationUsers'});
const FundApplicationUserModel = mongoose.model('fundApplicationUsers', fundApplicationUserSchema);
module.exports = FundApplicationUserModel;