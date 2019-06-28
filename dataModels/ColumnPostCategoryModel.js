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
/*
* 拓展专栏内容分类
* */
schema.statics.extendCategories = async (categories) => {
  const ColumnPostModel = mongoose.model("columnPosts");
  const results = [];
  for(let c of categories) {
    c = c.toObject();
    c.count = await ColumnPostModel.count({cid: c._id});
    results.push(c);
  }
  return results;
};

module.exports = mongoose.model("columnPostCategories", schema);