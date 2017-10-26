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

async function operateSystemID(type, op) {
  if(op !== 1 && op !== -1)
    throw 'invalid operation. a operation should be -1 or 1';
  let setting;
  const counterType = "counters." + type;
  const attrObj = {};
  attrObj[counterType] = op;
  try {
    setting = await this.findOneAndUpdate({uid: 'system'}, {$inc: attrObj});
  } catch(e) {
    throw 'invalid id type, a type should be one of these [resources, users, posts, threadTypes, threads].'
  }
  return setting.counters[type] + op;
}


settingSchema.statics.operateSystemID = operateSystemID;

module.exports = mongoose.model('settings', settingSchema);