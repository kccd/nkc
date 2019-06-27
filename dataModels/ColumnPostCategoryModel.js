const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  columnId: {
    type: Number,
    required: true,
    index: 1
  },
  name: {
    type: String,
    required: true,
    index: 1
  },
  description: {
    type: String,
    default: ""
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: "columnPostCategories"
});

module.exports = mongoose.model("columnPostCategories", schema);