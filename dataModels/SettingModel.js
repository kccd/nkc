const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const settingSchema = new Schema({
  _id: String,
  c: {
    type: Schema.Types.Mixed,
    default: {}
  }
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
  const SettingModel = mongoose.model('settings');
  if(op !== 1 && op !== -1) throw 'invalid operation. a operation should be -1 or 1';
  const setting = await SettingModel.findOne({_id: 'counters'});
  if(!setting) throw 'counters settings not found';
  if(!setting.c[type]) {
    setting.c[type] = op;
  } else {
    setting.c[type] += op;
  }
  await setting.update({c: setting.c});
  return setting.c[type];
  /*if(op !== 1 && op !== -1)
    throw 'invalid operation. a operation should be -1 or 1';
  let setting;
  const counterType = "c." + type;
  const attrObj = {};
  attrObj[counterType] = op;
  try {
    setting = await this.findOneAndUpdate({_id: 'counters'}, {$inc: attrObj});
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
  return number + op;*/
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
module.exports = mongoose.model('settings', settingSchema);