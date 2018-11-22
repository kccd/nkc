const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const activityApplySchema = new Schema({
  acid: {
    type: String,
    required: true
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
  enrollInfo: {
    type: [Schema.Types.Mixed],
    default: []
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

activityApplySchema.virtual('activity')
.get(function() {
  return this._activity;
})
.set(function(activity) {
  this._activity = activity;
});

activityApplySchema.methods.extendActivity = async function() {
  const ActivityModel = mongoose.model('activity');
  const activity = await ActivityModel.findOnly({acid: this.acid});
  return this.activity = activity.toObject();
};

module.exports = mongoose.model('activityApply', activityApplySchema, 'activityApply');