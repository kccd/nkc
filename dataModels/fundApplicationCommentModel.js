const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationCommentSchema = new Schema({
  _id: Number,
  applicationFormId: {
    type: Number,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  c: {
    type: String,
    required: true
  },

}, {
  collection: 'fundApplicationComments'
});

const FundApplicationHistoryModel = mongoose.model('fundApplicationComments', fundApplicationCommentSchema);
module.exports = FundApplicationHistoryModel;