const settings = require('../settings');
const {database} = settings;
const {Schema} = database;

const usersBehaviorSchema = new Schema({
  timeStamp: {
    type: String,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  toUid: {
    type: String,
    required: true,
    index: 1
  },
  pid: {
    type: String,
    index: 1
  },
  tid: {
    type: String,
    index: 1,
  },
  fid: {
    type: String,
    index: 1
  },
  mid: {
    type: String,
    index: 1
  },
  toMid: {
    type: String,
    index: 1
  },
  ip: {
    type: String,
    required: true,
    index: 1
  },
  port: {
    type: String,
    required: true,
    index: 1
  },
  score: {
    type: Number,
    default: 0,
  },
  isManageOp: {
    type: Boolean,
    default: false,
    index: 1
  },
  operation: {
    type: String,
    required: true,
    index: 1
  },
  type: {
    type: String,
    default: 'unclassified',
    index: 1
  },
  attrChange: {
    name: String,
    change: Number
  }
});

const UsersBehaviorModel = database.model('usersBehaviors', usersBehaviorSchema);

module.exports = UsersBehaviorModel;
