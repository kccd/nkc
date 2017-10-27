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
    threads: Number,
    questions:Number,
    collections: Number
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
let Setting = mongoose.model('settings', settingSchema);
new Setting({uid: 'system',ads: [
  '82312',
  '82340',
  '82333',
  '82282',
  '80787',
  '65452'
], popPersonalForums:['10','74185','73327','74156','74856','78451'],counters:{
  resources: 1,
  users: 80000,
  posts: 840234,
  threadTypes: 315,
  threads: 82375,
  questions: 252,
  collections: 3392
}}).save();
//module.exports = mongoose.model('settings', settingSchema);