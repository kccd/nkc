const settings = require('../settings');
const mongoose = settings.database;
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
  /* templates模板对象格式
  {
    type: "digestThread",
    content: "您的文章[link=threadURL(threadTitle)]已被列入精选。",
    parameters: [
      "threadTitle",
      "threadID",
      "threadURL"
    ]
  }
  * */
  templates: []
}, {
  collection: "messageTypes"
});

module.exports = mongoose.model("messageTypes", schema);
