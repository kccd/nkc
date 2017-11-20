const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const activeUserSchema = new Schema({
  lWThreadCount: {
    type: Number,
    default: 0
  },
  lWPostCount: {
    type: Number,
    default: 0
  },
  vitality: {
    type: Number,
    default: 0,
    index: 1
  },
  uid: {
    type: String,
    unique: true,
    required: true
  }
});

activeUserSchema.methods.extend = async function() {
  const UserModel = require('./UserModel');
  const user = await UserModel.findOnly({uid: this.uid});
  //this.set(username, user.username)
};

module.exports = mongoose.model('activeUsers', activeUserSchema, 'activeUsers');