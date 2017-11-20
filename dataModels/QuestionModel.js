const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  qid:{
    type: Number,
    unique: true,
    required: true
  },
  tlm: {
    type: Date,
  },
  toc: {
    type: Date,
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
});

questionSchema.methods.getUser = async function () {
  const UserModel = require('./UserModel');
  return await UserModel.findOnly({uid: this.uid});
};

questionSchema.methods.delete = async function () {
  const QuestionModel = require('./QuestionModel');
  return await QuestionModel.deleteOne({qid: this.qid});
};

questionSchema.methods.extend = async function () {
  const UserModel = require('./UserModel');
  const user = await UserModel.findOnly({uid: this.uid});
  return Object.assign(this.toObject(), {user});
};


module.exports = mongoose.model('questions', questionSchema);