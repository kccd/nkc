const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // postSurveyId
  psId: {
    type: Number,
    required:true,
    index: 1
  },
  // postSurveyType
  type: {
    type: String,
    required: true,
    index: 1
  },

}, {
  collection: "postSurveys"
});
module.exports = mongoose.model("postSurveyOptions", schema);