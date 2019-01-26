const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const usersSubscribeSchema = new Schema({
	uid: {
		type: String,
		unique: true,
    required: true
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
},
{toObject: {
  getters: true,
  virtuals: true
}});

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

usersSubscribeSchema.virtual('subscribeDisciplines')
  .get(function() {
    return this._subscribeDisciplines;
  })
  .set(function(s) {
    this._subscribeDisciplines = s;
  });

usersSubscribeSchema.virtual('subscribeTopics')
  .get(function() {
    return this._subscribeTopics;
  })
  .set(function(s) {
    this._subscribeTopics = s;
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

usersSubscribeSchema.methods.extendSubscribeDisciplines = async function(existsFid) {
  const ForumModel = require('./ForumModel');
  const subscribeDisciplines = [];
  let eFid = "";
  if(existsFid) eFid=existsFid
  var eIndex = this.subscribeForums.indexOf(existsFid);
  if(eIndex < 0 && existsFid !== "") this.subscribeForums.unshift(existsFid);
  for(let fid of this.subscribeForums) {
    const discipline = await ForumModel.findOne({fid:fid});
    if(discipline.forumType == "discipline") {
      subscribeDisciplines.push(discipline)
    }
  }
  return this.subscribeDisciplines = subscribeDisciplines;
}

usersSubscribeSchema.methods.extendSubscribeTopics = async function(existsFid) {
  const ForumModel = require('./ForumModel');
  const subscribeTopics = [];
  let eFid = "";
  if(existsFid) eFid=existsFid
  var eIndex = this.subscribeForums.indexOf(existsFid);
  if(eIndex < 0 && existsFid !== "") this.subscribeForums.unshift(existsFid)
  for(let fid of this.subscribeForums) {
    const topic = await ForumModel.findOne({fid:fid});
    if(topic.forumType == "topic") {
      subscribeTopics.push(topic)
    }
  }
  return this.subscribeTopics = subscribeTopics;
}

module.exports = mongoose.model('usersSubscribe', usersSubscribeSchema, 'usersSubscribe');