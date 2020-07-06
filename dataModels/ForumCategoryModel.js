const mongoose = require('../settings/database');
const schema = mongoose.Schema({
  _id: Number,
  name: {
    type: String,
    required: true,
    index: 1,
  },
  description: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 1,
    index: 1
  }
}, {
  collection: 'forumCategories'
});

/*
* 获取全部专业分类并更具order排序
* @return {[Object]} 专业分类对象组成的数组
* @author pengxiguaa 2020/7/3
* */
schema.statics.getCategories = async () => {
  const ForumCategoryModel = mongoose.model('forumCategories');
  const categories = await ForumCategoryModel
    .find({}, {_id: 1, name: 1, description: 1})
    .sort({order: 1});
  return categories.map(c => {
    const {_id, name, description} = c;
    return {
      _id, name, description
    };
  });
};

module.exports = mongoose.model('forumCategories', schema);
