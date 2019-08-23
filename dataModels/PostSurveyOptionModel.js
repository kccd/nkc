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
  // 选项标题
  title: {
    type: String,
    required: true
  },
  // 选项介绍
  description: {
    type: String,
    default: ""
  },
  // 选项图片
  resourcesId: {
    type: String,
    default: []
  },
  // 选项链接
  links: {
    type: String,
    default: []
  }
}, {
  collection: "postSurveys"
});
module.exports = mongoose.model("postSurveyOptions", schema);