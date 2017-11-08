const settings = require('../settings');
const {mongoose} = settings;
const {Schema} = mongoose;

const usersBehaviorSchema = new Schema({
  toc: {
    type: String,
    default: Date.now
  },
  uid: {
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
  isManageOp: {
    type: Boolean,
    default: false
  },
  scoreChange: {
    type: Number,
    default: 0
  },
  attrChange: {
    change: {
      type: Number,
      default: 0,
    },
    name: String
  }
});