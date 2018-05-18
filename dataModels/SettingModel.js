const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const settingSchema = new Schema({
  type: { // system, fund, kcb
    type: String,
    unique: true,
    required: true
  },

	//系统设置
	//---------------------------------------
  ads: {
    type: [String]
  },
  popPersonalForums: {
    type: [String]
  },
  counters: {
    resources: Number,
    users: Number,
    posts: Number,
    threadTypes: Number,
    threads: Number,
    questions:Number,
    collections: Number,
    sms: Number,
    fundApplicationForms: Number,
	  photos: Number,
    forums: Number,
    fundDocuments: Number,
    drafts: Number,
	  operationTypes: Number
  },

	//科创基金设置
  //-------------------------------------
	description: {
  	type: String,
		maxlength: [500, '字数不能大于500个字']
	},
	terms: String,
	money: Number,
	donationDescription: String,
	fundPoolDescription: String,
	closed: {
  	status: Boolean,
		reason: String,
		openingHours: Date,
		closingTime: Date,
		uid: String,
		username: String
	},
	readOnly: Boolean,

	//科创币
	//-------------------------------------
	defaultUid: String,
	changeUsername: Number,

	//网站设置
	//-------------------------------------
	websiteName: String,
	serverName: {
  	type: String,
		get: function(n) {
  		return n.replace('$', global.NKC.NODE_ENV)
		}
	},
	port: Number,
	httpsPort: Number,
	useHttps: Boolean,
	databaseName: String,
	address: String,
	github: String,
	copyright: String,
	record: String,
	// description: String,
	keywords: [String],
	brief: String,
	language: String
},
{toObject: {
  getters: true,
  virtuals: true
}});

settingSchema.virtual('adThreads')
  .get(function() {
    return this._adThreads;
  })
  .set(function(ads) {
    this._adThreads = ads;
  });

async function operateSystemID(type, op) {
  if(op !== 1 && op !== -1)
    throw 'invalid operation. a operation should be -1 or 1';
  let setting;
  const counterType = "counters." + type;
  const attrObj = {};
  attrObj[counterType] = op;
  try {
    setting = await this.findOneAndUpdate({type: 'system'}, {$inc: attrObj});
  } catch(e) {
    throw 'invalid id type, a type should be one of these [resources, users, posts, threadTypes, threads].'
  }
  let number = setting.counters[type];
  if(isNaN(number)) {
		number = 0;
		const settings = await this.findOnly({type: 'system'});
		const {counters} = settings;
		counters[type] = op;
		await settings.update({counters});
  }
  return number + op;
}

settingSchema.statics.operateSystemID = operateSystemID;

settingSchema.methods.extend = async function() {
  const ThreadModel = require('./ThreadModel');
  const PostModel = require('./PostModel');
  let ads = this.ads;
  for (let i = 0; i < ads.length; i++) {
    const thread = await ThreadModel.findOnly({tid: ads[i]});
    const post = await PostModel.findOnly({pid: thread.oc});
    ads[i] = Object.assign(thread, {post});
  }
  const targetSetting = this.toObject();
  targetSetting.ads = ads;
  return targetSetting;
};

settingSchema.methods.extendAds = async function() {
  const ThreadModel = require('./ThreadModel');
  const adThreads = await Promise.all(this.ads.map(async tid => {
    const thread = await ThreadModel.findOnly({tid});
    await thread.extendFirstPost();
    return thread;
  }));
  return this.adThreads = adThreads;
};

/*let Setting = mongoose.model('settings', settingSchema);
new Setting({type: 'system',ads: [1], popPersonalForums:[1],counters:{
  resources: 1,
  users: 80000,
  posts: 850000,
  threadTypes: 315,
  threads: 83000,
  questions: 300,
  collections: 4000
}}).save();*/
module.exports = mongoose.model('settings', settingSchema);