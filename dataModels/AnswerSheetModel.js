const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const answersheetsSchema = new Schema({
	key: {
    type: String,
    required: true,
    unique: true
  },
  uid: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
  },
  toc: {
    type: Number,
    default: Date.now,
  },
  tsm: {
    type: Number,
    default: Date.now,
  },
  ip: {
    type: String,
    default: '0.0.0.0',
    index: 1
  },
  isA: {
    type: Boolean,
    default: false
  },
  records: {
    type: Array,
    required: true
  },
  category: {
    type: String,
    default: 'undefined'
  }
});
answersheetsSchema.pre('save', function(next) {
  let num = 0;
  for (let answer in this.records) {
    if (answer.correct) {
      num++;
    }
  }
  this.score = num;
  next();
})
module.exports = mongoose.model('answersheets', answersheetsSchema);