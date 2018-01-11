const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationUserSchema = new Schema({
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	uid: {
		type: String,
		required: true,
		index: 1
	},
	agree: {
		type: Boolean,
		default: null,
		index: 1
	},
	applicationFormId: {
		type: Number,
		required: true,
		index: 1
	},
	tlm: {
		type: Date,
		default: null,
		index: 1
	},
	name: {
		type: String,
		default: null,
		index: 1
	},
	idCardNumber: {
		type: String,
		default: null,
		index: 1
	},
	mobile: {
		type: String,
		default: null,
		index: 1
	},
	description: {
		type: String,
		default: null,
		index: 1
	},
	idCardPhotos: {
		type: [Number],
		default: null,
		index: 1
	},
	handheldIdCardPhoto: {
		type: Number,
		default: null,
		index: 1
	},
	lifePhotos: {
		type: [Number],
		default: null,
		index: 1
	},
	certsPhotos: {
		type: [Number],
		default: null,
		index: 1
	}
}, {collection: 'fundApplicationUsers'});


const savePrivateInfo  = async (aUser) => {
	const UserPersonalModel = require('./UsersPersonalModel');
	const {uid} = aUser;
	const userPersonal = await UserPersonalModel.findOnly({uid});
	const {privateInfo} = userPersonal.toObject();
	aUser.idCardPhotos = privateInfo.idCardPhotos;
	aUser.handheldIdCardPhoto = privateInfo.handheldIdCardPhoto;
	aUser.lifePhotos = privateInfo.lifePhotos;
	aUser.certsPhotos = privateInfo.certsPhotos;
	await aUser.save();
};

fundApplicationUserSchema.post('find', async function(applicationUsers) {
	await Promise.all(applicationUsers.map(async aUser => {
		await savePrivateInfo(aUser);
	}));
});

fundApplicationUserSchema.post('findOne', async function(aUser) {
	await savePrivateInfo(aUser);
});


fundApplicationUserSchema.virtual('user')
	.get(function() {
		return this._user;
	})
	.set(function(u) {
		this._user = u;
	});

fundApplicationUserSchema.methods.extendUser = async function() {
	const UserModel = require('./UserModel');
	const user = await UserModel.findOnly({uid: this.uid});
	return this.user = user;
};
const FundApplicationUserModel = mongoose.model('fundApplicationUsers', fundApplicationUserSchema);
module.exports = FundApplicationUserModel;
