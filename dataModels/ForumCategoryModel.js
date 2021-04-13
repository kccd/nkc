const mongoose = require('../settings/database');
const schema = mongoose.Schema({
  _id: Number,
  // 分类名
  name: {
    type: String,
    required: true,
    index: 1,
  },
  // 分类介绍
  description: {
    type: String,
    default: '',
  },
  // 序号
  order: {
    type: Number,
    default: 1,
    index: 1
  },
  // 分类下专业的显示风格
  displayStyle: {
    type: String,
    default: 'simple', // simple: 简单显示(名称+头像)，normal: 正常显示（名称+头像+简介）, detailed: 详细显示（包含简介以及最新文章）,
  },
  // 与自己互斥
  mutuallyExclusiveWithSelf: {
    type: Boolean,
    index: 1,
    default: false,
  },
  // 与别人互斥
  mutuallyExclusiveWithOthers: {
    type: Boolean,
    index: 1,
    default: false,
  },
  // 互斥的专业分类ID，选择当前分类之后不能选择excludedCategoriesId中存在的专业分类
  excludedCategoriesId: {
    type: [Number],
    default: [],
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
    .find({})
    .sort({order: 1});
  const _forumCategories = [];
  for(const fc of forumCategories) {
    const {
      _id, name, description, displayStyle,
      mutuallyExclusiveWithOthers,
      mutuallyExclusiveWithSelf,
      excludedCategoriesId,
    } = fc;
    const count = await ForumModel.countDocuments({categoryId: _id});
    _forumCategories.push({
      _id,
      name,
      description,
      displayStyle,
      count,
      mutuallyExclusiveWithOthers,
      mutuallyExclusiveWithSelf,
      excludedCategoriesId
    });
  }
  await client.setAsync(redisKey, JSON.stringify(_forumCategories));
};

/*
* 获取含有专业的专业分类并根据order排序
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
