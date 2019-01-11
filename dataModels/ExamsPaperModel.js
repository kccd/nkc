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
  submitted: {
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
});

module.exports = mongoose.model('examsPapers', schema);