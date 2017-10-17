const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const usersPersonalSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    default: '',
    match: /.*@.*/
  },
  mobile: {
    type: String,
    default:'',
    index: 1
  },
  hashType: {
    type: String,
    default: ''
  },
  lastTry: {
    type: Number,
    default: 0
  },
  password: {
    salt: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
    }
  },
  new_message: {
    replies: {
      type: Number,
      default: 0
    },
    message: {
      type: Number,
      default: 0
    },
    system: {
      type: Number,
      default: 0
    },
    at: {
      type: Number,
      default: 0
    }
  },
  regcode: {
    type: String,
    default: ''
  },
  regip: {
    type: String,
    default: ''
  },
  tries: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('usersPersonal', usersPersonalSchema, 'usersPersonal');