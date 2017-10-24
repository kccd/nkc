const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let EmailRegisterSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now
  },
  ecode: {
    type: String,
    required: true,
    index: 1
  },
  email: {
    type: String,
    required: true,
    index: 1
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  password:{
    salt: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
    }
  }
});

module.exports = mongoose.model('emailRegister', EmailRegisterSchema, 'emailRegister');