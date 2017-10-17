const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  tlm: {
    type: Number,
  },
  toc: {
    type: Number,
    default: Date.now,
    index: 1
  },
  category: {
    type: String,
    required: true,
    index: 1
  },
  type: {
    type: String,
    required: true
  },
  uid: {
    unique: true,
    type: String,
    required: true,
  },
  username: {
    type: String,
    default: ''
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: [String],
    required: true
  }
});
questionSchema.pre('save', function(next){
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  next();
})

module.exports = mongoose.model('questions', questionSchema);