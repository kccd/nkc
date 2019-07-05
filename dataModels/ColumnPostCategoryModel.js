const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  columnId: {
    type: Number,
    required: true,
    index: 1
  },
  topped: {
    type: [Number],
    default: [],
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
  level: {
    type: Number,
    default: 0,
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

schema.statics.findById = async (_id) => {
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const category = await ColumnPostCategoryModel.findOne({_id});
  if(category) {
    const categories = await ColumnPostCategoryModel.extendCategories([category]);
    return categories[0];
  }
  return null;
};

schema.statics.getCategoryNav = async (_id) => {
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const category = await ColumnPostCategoryModel.findOne({_id});
  if(!category) return [];
  const categories = await ColumnPostCategoryModel.find({columnId: category.columnId});
  const categoriesObj = {};
  categories.map(c => {
    categoriesObj[c._id] = c;
  });
  const arr = [];
  const func = (category) => {
    arr.unshift(category);
    if(category.parentId) {
      const parentCategory = categoriesObj[category.parentId];
      if(parentCategory) func(parentCategory);
    }
  };
  func(category);
  return arr;
};
/*
* 计算专栏文章分类的等级
* @param {String} _id 专栏ID
* */
schema.statics.computeCategoryOrder = async (_id) => {
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const categoriesList = await ColumnPostCategoryModel.getCategoryList(_id);
  await Promise.all(categoriesList.map(async c => {
    await ColumnPostCategoryModel.updateOne({
      _id: c._id
    }, {
      $set: {
        level: c.level
      }
    });
  }));
};
/*
* 获取所有下级分类
* @param {Number} categoryId 分类ID
* @return [Object] 所有分类对象组成的数组
* @author pengxiguaa 2019-7-5
* */
schema.statics.getChildCategory = async (categoryId) => {
  const ColumnPostCategoryModel = mongoose.model("columnPostCategories");
  const category = await ColumnPostCategoryModel.findOne({_id: categoryId});
  const results = [];
  const categories = await ColumnPostCategoryModel.getCategoryList(category.columnId);
  const func = (category) => {
    for(const c of categories) {
      if(c.parentId === category._id) {
        results.push(c);
        func(c);
      }
    }
  };
  func(category);
  return results;
};
/*
* 获取所有下级分类ID
* @param {Number} categoryId 分类ID
* @return [Object] 所有分类ID组成的数组
* @author pengxiguaa 2019-7-5
* */
schema.statics.getChildCategoryId = async (categoryId) => {
  const results = await mongoose.model("columnPostCategories").getChildCategory(categoryId);
  return results.map(r => r._id);
};
module.exports = mongoose.model("columnPostCategories", schema);