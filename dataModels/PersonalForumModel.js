const settings = require('../settings');
const mongoose = settings.database;
const {getQueryObj} = require('../nkcModules/apiFunction');
const Schema = mongoose.Schema;
let personalForumsSchema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    default: 'forum'
  },
  abbr: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  descriptionOfForum: {
    type: String,
    required: true
  },
  moderators: {
    type: [String],
    default: []
  },
  recPosts: {
    type: [String],
    default: []
  },
  toppedThreads: {
    type: [String],
    default: []
  },
  announcement: {
    type: String,
    default: ''
  }
});

personalForumsSchema.virtual('moderatorsObj')
  .get(function() {
    if(!this._moderatorsObj) {
      throw new Error('moderatorsObj is not initialized.');
    }
    return this._moderatorsObj;
  })
  .set(function(m) {
    this._moderatorsObj = m;
  });

personalForumsSchema.methods.extendModerator = async function() {
  const u = await mongoose.connection.db.collection('users')
      .find({uid: {$in: this.moderators}}).toArray();
  return this.moderatorsObj = u;
};

module.exports = mongoose.model('personalForums', personalForumsSchema, 'personalForums');