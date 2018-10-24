const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const activityPostSchema = new Schema({
  acid: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    default: null
  },
  commentContent: {
    type: String,
    default: null
  },
  toUid: {
    type: String,
    default: null
  },  
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
},
{
  toObject: {
    getters: true,
    virtuals: true
  }
});

activityPostSchema.methods.extendUser = async function() {
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOnly({uid: this.uid});
  return this.user = user;
};

module.exports = mongoose.model('activityPost', activityPostSchema, 'activityPost');