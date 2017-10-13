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

module.exports = mongoose.model('usersSubscribe', usersSubscribeSchema, 'usersSubscribe');