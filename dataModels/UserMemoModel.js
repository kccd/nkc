const mongoose = require('../settings/database');
const collectionName = 'userMemos';
const schema = new mongoose.Schema(
  {
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    uid: {
      type: String,
      required: true,
      index: 1,
    },
    tUid: {
      type: String,
      required: true,
      index: 1,
    },
    nickname: {
      type: String,
      default: '',
    },
    desc: {
      type: String,
      default: '',
    },
  },
  {
    collection: collectionName,
  },
);

module.exports = mongoose.model(collectionName, schema);
