const settings = require('../settings');
const {database} = settings;
const {Schema} = database;

const usersBehaviorSchema = new Schema({
  timeStamp: {
    type: String,
    default: Date.now
  },
  uid: {
    type: String,
    required: true
  },
  toUid: {
    type: String,
    required: true
  },
  pid: {
    type: String,
    required: true,
  },
  tid: {
    type: String,
    required: true
  },
  fid: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  port: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0,
  },
  isManageOp: {
    type: Boolean,
    default: false
  },
  operation: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'unclassified'
  }
});

const UsersBehaviorModel = mongoose.model('usersBehaviors', usersBehaviorSchema);

module.exports = UsersBehaviorModel;
