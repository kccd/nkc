const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const activityApplySchema = new Schema({
  acid: {
    type: String,
    required: true
  },
  age: {
    type: String,
    default: null
  },
  education: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  kcName: {
    type: String,
    default: null
  },
  mobile: {
    type: String,
    default: null
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true
  },
  qqNum: {
    type: String,
    default:null
  },
  wxNum: {
    type: String,
    default: null
  },
  realName: {
    type: String,
    default: null
  },
  wordUnit: {
    type: String,
    default: null
  },
  applyStatus: {
    type: String,
    default: "success"
  },
  // 主动取消：active
  // 被动取消：passive
  cancelReason: {
    type: String,
    default: null
  },
  cancelToc: {
    type: Date,
    default: null,
    index: 1
  },
  cancelDescription: {
    type: String,
    default: null
  }
},
{
  toObject: {
    getters: true,
    virtuals: true
  }
});

activityApplySchema.methods.extendActivity = async function() {
  const ActivityModel = mongoose.model('activity');
  const activity = await ActivityModel.findOnly({acid: this.acid});
  return this.activity = activity;
};

module.exports = mongoose.model('activityApply', activityApplySchema, 'activityApply');