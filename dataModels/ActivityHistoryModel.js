const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const activityHistorySchema = new Schema({
  acid: {
    type: String,
    required: true
  },
  activityTitle: {
    type: String,
    default: null
  },
  enrollStartTime: {
    type: String,
    default: null
  },
  enrollEndTime: {
    type: String,
    default: null
  },
  holdStartTime: {
    type: String,
    default: null
  },
  holdEndTime: {
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
  address: {
    type: String,
    default:null
  },
  limitNum: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: null
  },
  sponsor: {
    type: String,
    default: null
  },
  posterId: {
    type: String,
    default: null
  },
  contactNum: {
    type: String,
    default: null
  },
  continueTofull: {
    type: Boolean,
    default: false
  }
},
{
  toObject: {
    getters: true,
    virtuals: true
  }
});

module.exports = mongoose.model('activityHistory', activityHistorySchema, 'activityHistory');