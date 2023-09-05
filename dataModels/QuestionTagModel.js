const mongoose = require('../settings/database');
const collectionName = 'questionTags';
const schema = new mongoose.Schema(
  {
    _id: Number,
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    name: {
      type: String,
      index: 1,
      required: true,
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
