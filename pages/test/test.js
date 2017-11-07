let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.15');
db.useDatabase('rescue');
let users_personalSchema = new Schema({
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
    type: Number,
    default: '0'
  },
  tries: {
    type: Number,
    default: 0
  }
});

let UsersPersonal = mongoose.model('usersPersonal', users_personalSchema, 'usersPersonal');
let a = 'newMessage.system';
UsersPersonal.updateOne({uid: "74185"}, {$set: {: 1000}});