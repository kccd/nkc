const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const redisClient = require('../settings/redisClient');

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
  const q = {
    $inc: {}
  };
  q.$inc[`c.${type}`] = op;
  const setting = await SettingModel.findOneAndUpdate({_id: 'counters'}, q);
  if(!setting) throw 'counters settings not found';
  if(setting.c[type] === undefined) {
    setting.c[type] = 1;
    const obj = {
      $set: {}
    };
    obj.$set[`c.${type}`] = 1;
    await setting.update(obj);
  } else {
    setting.c[type] += op;
  }
  return setting.c[type];
}

settingSchema.statics.operateSystemID = operateSystemID;

settingSchema.statics.newObjectId = () => {
  return mongoose.Types.ObjectId();
};

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
/* 
  通过系统设置的ID查找数据
  @return setting
  @author pengxiguaa 2019/3/7
*/
settingSchema.statics.findById = async (_id) => {
  const SettingModel = mongoose.model('settings');
  const setting = await SettingModel.findOne({_id});
  if(!setting) throwErr(404, `未找到ID为【${_id}】的系统设置`);
  return setting;
};

/*
* 通过ID查找设置 返回settings.c
* @param {String} _id
* */
settingSchema.statics.getSettings = async (_id) => {
  let settings = await redisClient.getAsync(`settings:${_id}`);
  if(!settings) {
    settings = await mongoose.model("settings").saveSettingsToRedis(_id);
  } else {
    settings = JSON.parse(settings);
  }
  return settings.c;
};
settingSchema.statics.saveSettingsToRedis = async (_id) => {
  const SettingModel = mongoose.model("settings");
  const settings = await SettingModel.findOne({_id});
  if(settings) {
    setTimeout(async () => {
      await redisClient.setAsync(`settings:${_id}`, JSON.stringify(settings));
    });
  }
  return settings;
};

module.exports = mongoose.model('settings', settingSchema);