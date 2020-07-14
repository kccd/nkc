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

const redisKey = `forumCategories`;

/*
* 将专业分类数据存到redis数据库
* */
schema.statics.saveCategoryToRedis = async () => {
  const ForumCategoryModel = mongoose.model('forumCategories');
  const ForumModel = mongoose.model('forums');
  const client = require('../settings/redisClient');
  const forumCategories = await ForumCategoryModel
    .find({}, {_id: 1, name: 1, description: 1})
    .sort({order: 1});
  const _forumCategories = [];
  for(const fc of forumCategories) {
    const {_id, name, description} = fc;
    const count = await ForumModel.count({categoryId: _id});
    _forumCategories.push({
      _id,
      name,
      description,
      count
    });
  }
  await client.setAsync(redisKey, JSON.stringify(_forumCategories));
};

/*
* 获取全部专业分类并更具order排序
* @return {[Object]} 专业分类对象组成的数组
* @author pengxiguaa 2020/7/3
* */
schema.statics.getCategories = async () => {
  const ForumCategoryModel = mongoose.model('forumCategories');
  const categories = await ForumCategoryModel.getAllCategories();
  return categories.filter(c => c.count > 0);
};

/*
* 获取全部专业分类
* @return {[Object]} 专业分类对象组成的数组
* @author pengxiguaa 2020/7/6
* */
schema.statics.getAllCategories = async () => {
  const client = require('../settings/redisClient');
  let forumCategories = await client.getAsync(redisKey);
  forumCategories = JSON.parse(forumCategories);
  return forumCategories;
};

module.exports = mongoose.model('forumCategories', schema);
