const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let EmailRegisterSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now,
    index: 1
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
    index: 1,
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
  },
  isA: {
    type: Boolean,
    default: false
  },
  hashType: {
    type: String,
    required: true
  },
  regCode: {
    type: String,
    required: true
  },
  regIP: {
    type: String,
    default: '0.0.0.0'
  },
  regPort: {
    type: String,
    default: '0'
  },
  used: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('emailRegister', EmailRegisterSchema, 'emailRegister');