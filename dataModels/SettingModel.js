const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const settingSchema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true
  },
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
    threads: Number
  }
});

async function getSystemID(type) {
  let setting;
  const counterType = "counters." + type;
  const queryObj = {};
  queryObj[counterType] = 1;
  try {
    setting = await this.findOneAndUpdate({uid: 'system'}, {$inc: queryObj});
  } catch(e) {
    throw 'invalid id type, a type should be one of these [resources, users, posts, threadTypes, threads].'
  }
  return setting.counters[type] + 1;
}

settingSchema.statics.getSystemID = getSystemID;

module.exports = mongoose.model('settings', settingSchema);