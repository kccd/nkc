const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const usersSubscribeSchema = new Schema({
	uid: {
		type: String,
		unique: true
	},
	subscribeForums: {
		type: [String],
		default: []
	},
	subscribeUsers: {
		type: [String],
		default: []
	},
	subscribers: {
		type: [String],
		default: []
	}
});

usersSubscribeSchema.methods.extend = async function() {
	const UserModel = require('./UserModel');
	let subscribers = [];
	let subscribUsers = [];
	subscribers = await Promise.all(this.subscribers.map(async uid => await UserModel.findOnly({uid})));
	subscribUsers = await Promise.all(this.subscribeUsers.map(async uid => await UserModel.findOnly({uid})));
  return Object.assign(this.toObject(), {subscribers, subscribeUsers});
};


module.exports = mongoose.model('usersSubscribe', usersSubscribeSchema, 'usersSubscribe');