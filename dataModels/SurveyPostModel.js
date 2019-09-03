const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  surveyId: {
    type: Number,
    required: true,
    index: 1
  },
  surveyType: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    default: "",
    index: 1
  },
  options: {
    type: Schema.Types.Mixed,
    default: []
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  ip: {
    type: String,
    default: '',
    index: 1
  },
  port: {
    type: String,
    default: ""
  }
}, {
  collection: "surveyPosts"
});
module.exports = mongoose.model("surveyPosts", schema);