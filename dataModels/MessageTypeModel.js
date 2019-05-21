const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: String,
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  templates: []
}, {
  collection: "messageTypes"
});
module.exports = mongoose.model("messageTypes", schema);