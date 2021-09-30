/*
* 文章的多维分类（独立于专业和专业下的文章分类）
* */
const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: Number,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 作为维度下的分类时，当前字段表示维度 ID，否则为 null
  cid: {
    type: Number,
    default: null,
    index: 1
  },
  // 维度名称或维度下的分类名称
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 维度介绍或维度下的分类介绍
  description: {
    type: String,
    default: ''
  },
  // 图标
  icon: {
    type: String,
    default: ''
  },
  // 排序
  order: {
    type: Number,
    default: 0,
    index: 1
  },
  // 是否启用
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: 'threadCategories'
});

schema.statics.getCategoryTree = async () => {
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const categories = await ThreadCategoryModel.find({}).sort({order: 1});
  const master = [];
  const nodes = {};
  for(let c of categories) {
    c = c.toObject();
    if(c.cid) {
      if(!nodes[c.cid]) {
        nodes[c.cid] = [];
      }
      nodes[c.cid].push(c);
    } else {
      master.push(c);
      if(!nodes[c._id]) {
        c.nodes = [];
        nodes[c._id] = c.nodes;
      } else {
        c.nodes = nodes[c._id];
      }
    }
  }
  return master;
};

schema.statics.newCategory = async (name, description, cid = null) => {
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const SettingModel = mongoose.model('settings');
  const tc = ThreadCategoryModel({
    _id: await SettingModel.operateSystemID('threadCategories', 1),
    name,
    description,
    cid
  });
  await tc.save();
  return tc;
};

module.exports = mongoose.model('threadCategories', schema);

