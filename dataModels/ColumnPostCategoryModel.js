const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  columnId: {
    type: Number,
    required: true,
    index: 1
  },
  order: {
    type: Number,
    default: 1000,
    index: 1
  },
  parentId: {
    type: Number,
    default: null,
    index: 1
  },
  default: {
    type: Boolean,
    default: false,
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

/*
* 获取专栏的分类树状结构
* @param {Number} columnId 专栏ID
* @author pengxiguaa 2019-7-2
* */

schema.statics.getCategoryTree = async (columnId) => {
  let categories = await mongoose.model("columnPostCategories").find({columnId}).sort({order: 1});
  const parents = [];
  const categoriesObj = {};
  categories = categories.map(c => {
    c = c.toObject();
    c.children = [];
    categoriesObj[c._id] = c;
    return c;
  });
  for(const c of categories) {
    c.count = await mongoose.model("columnPosts").count({cid: c._id});
    let insert = false;
    if(c.parentId) {
      const parent = categoriesObj[c.parentId];
      if(parent) {
        parent.children.push(c);
        insert = true;
      }
    }
    if(!insert) parents.push(c);
  }
  return parents;
};
/*
* 已分类名缩进表示层级关系
* */
schema.statics.getCategoryList = async (columnId) => {
  const categories = await mongoose.model("columnPostCategories").getCategoryTree(columnId);
  const arr = [];
  const func = (cc, index) => {
    for(const c of cc) {
      c.level = index;
      arr.push(c);
      if(c.children && c.children.length > 0) {
        func(c.children, index+1);
      }
    }
  };
  func(categories, 0);
  arr.map(a => {
    delete a.children
  });
  return arr;
};

module.exports = mongoose.model("columnPostCategories", schema);