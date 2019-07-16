const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  columnId: {
    type: String,
    required: true,
    index: 1
  },
  hidden: {
    type: Boolean,
    default: false
  },
  l: {
    type: String,
    default: "html"
  },
  t: {
    type: String,
    default: ""
  },
  c: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: null
  }
}, {
  collection: "columnPages"
});
module.exports = mongoose.model("columnPages", schema);