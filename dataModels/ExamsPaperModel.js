const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  score: {
    type: Number,
    default: 0
  },
  cid: {
    type: Number,
    required: true,
    index: 1
  },
  volume: {
    type: String, // A, B
    required: true,
    index: 1
  },
  // 是否提交试卷
  submitted: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 是否违规
  violation: {
    type: Boolean,
    default: false,
    index: 1
  },
  timeOut: {
    type: Boolean,
    default: false,
    index: 1
  },
  record: {
    type: [Schema.Types.Mixed],
    default: []
  },
  passed: {
    type: Boolean,
    default: null,
    index: 1
  },
  // 及格分数
  passScore: {
    type: Number,
    required: true
  }
  /*record: [
    {
      qid: {
        type: Number,
        required: true
      },
      answerIndex: {
        type: [Number],
        default: null
      },
      answer: {
        type: Schema.Types.Mixed,
        default: null
      },
      correct: {
        type: Boolean,
        default: null
      }
    }
  ]*/
}, {
  collection: 'examsPapers'
});

module.exports = mongoose.model('examsPapers', schema);