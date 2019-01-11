const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  disabledA: {
    type: Boolean,
    default: true,
    index: 1
  },
  disabledB: {
    type: Boolean,
    default: true,
    index: 1
  },
  uid: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 1,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questionsCount: {
    type: Number,
    default: 0
  },
  examsCount: {
    type: Number,
    default: 0
  },
  passedCount: {
    type: Number,
    default: 0
  },
  paperAQuestionsCount: {
    type: Number,
    default: 10
  },
  paperAPassScore: {
    type: Number,
    default: 6
  },
  paperBQuestionsCount: {
    type: Number,
    default: 10
  },
  paperBPassScore: {
    type: Number,
    default: 6
  },
  paperATime: {
    type: Number,
    default: 30 // 30分钟
  },
  paperBTime: {
    type: Number,
    default: 30 // 30分钟
  }
}, {
  collection: 'examsCategories'
});
module.exports = mongoose.model('examsCategories', schema);