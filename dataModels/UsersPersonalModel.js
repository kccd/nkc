const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const usersPersonalSchema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true
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
    required: true
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
  newMessage: {
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
  regIP: {
    type: String,
    default: '0.0.0.0'
  },
  regPort: {
    type: String,
    default: '0'
  },
  tries: {
    type: Number,
    default: 0
  }
});

usersPersonalSchema.methods.decrementPsnl = async function(type, number) {
  const UsersPersonalModel = require('./UsersPersonalModel');
  const userPersonal = await UsersPersonalModel.findOne({uid: this.uid});
  const {newMessage} = userPersonal;
  if(number === undefined) newMessage[type] = 0;
  else newMessage[type] += number;
  return await this.update({newMessage: newMessage});
};

usersPersonalSchema.methods.increasePsnl = async function(type, number) {
  const counterType = "newMessage." + type;
  if(number === undefined) {
    const attrObj = {};
    attrObj[counterType] = 0;
    return await this.update(attrObj);
  }
  const attrObj = {};
  attrObj[counterType] = number;
  return await this.update({$inc: attrObj});
};

module.exports = mongoose.model('usersPersonal', usersPersonalSchema, 'usersPersonal');