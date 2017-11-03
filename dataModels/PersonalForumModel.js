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

personalForumsSchema.methods.getThreadsByQuery = function(query, match) {
  const {$match, $sort, $skip, $limit} = getQueryObj(query, match);
  return mongoose.connection.db.collection('')
}

module.exports = mongoose.model('personalForums', personalForumsSchema, 'personalForums');