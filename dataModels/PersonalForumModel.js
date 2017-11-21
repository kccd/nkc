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

personalForumsSchema.methods.extendModerator = async function() {
  const u = await mongoose.connection.db.collection('users')
      .find({uid: {$in: this.moderators}}).toArray();
  const doc = this.toObject();
  doc.moderators = u;
  return doc
};

module.exports = mongoose.model('personalForums', personalForumsSchema, 'personalForums');