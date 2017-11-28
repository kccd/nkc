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

usersSubscribeSchema.virtual('subscribersObj')
  .get(function() {
    return this._subscribersObj;
  })
  .set(function(s) {
    this._subscribersObj = s;
  });

usersSubscribeSchema.virtual('subscribeUsersObj')
  .get(function() {
    return this._subscribeUsersObj;
  })
  .set(function(s) {
    this._subscribeUsersObj = s;
  });

usersSubscribeSchema.methods.extendSubscribers = async function() {
  const UserModel = require('./UserModel');
  const subscribers = await Promise.all(this.subscribers.map(async uid => await UserModel.findOnly({uid})));
  return this.subscribersObj = subscribers;
};

usersSubscribeSchema.methods.extendSubscribeUsers = async function() {
  const UserModel = require('./UserModel');
  const subscribeUsers = await Promise.all(this.subscribers.map(async uid => await UserModel.findOnly({uid})));
  return this.subscribersObj = subscribeUsers;
};



module.exports = mongoose.model('usersSubscribe', usersSubscribeSchema, 'usersSubscribe');