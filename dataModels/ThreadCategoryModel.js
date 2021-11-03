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
  // 默认子分类名称
  nodeName: {
    type: String,
    default: '默认',
  },
  // 警告 显示在编辑器页
  warning: {
    type: String,
    default: ''
  },
  // 文章页顶部公告
  threadWarning: {
    type: String,
    default: ''
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

schema.statics.getCategoryTree = async (match = {}) => {
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const categories = await ThreadCategoryModel.find(match).sort({order: 1});
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

schema.statics.newCategory = async (props) => {
  const {
    name,
    description,
    warning,
    cid,
    threadWarning
  } = props;
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const SettingModel = mongoose.model('settings');
  const tc = ThreadCategoryModel({
    _id: await SettingModel.operateSystemID('threadCategories', 1),
    name,
    warning,
    description,
    threadWarning,
    cid
  });
  await tc.save();
  return tc;
};

/*
* 检查选择的分类是否全为子分类并且判断任意两个子分类是否属于相同的主分类
* @param {[Number]} tcId 分类 ID
* */
schema.statics.checkCategoriesId = async (tcId) => {
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const categories = await ThreadCategoryModel.find({
    _id: {$in: tcId},
    cid: {$ne: null}
  });
  if(categories.length !== tcId.length) {
    const _tcId = [];
    const parentCategoriesId = [];
    for(const c of categories) {
      _tcId.push(c._id);
      if(parentCategoriesId.includes(c.cid)) {
        throwErr(400, `同一分类下只能选择一个子分类`);
      } else {
        parentCategoriesId.push(c.cid);
      }
    }
    const errorTcId = tcId.filter(id => !_tcId.includes(id));
    throwErr(400, `文章多维分类 ${errorTcId.join(', ')} 错误`);
  }
}

/*
* 获取属性
* @param {[String]} tcId 属性 ID 组成的数组
* @return {Object} 属性对象组成的数组
*   @param {Number} _id 属性 ID
*   @param {String} name 属性名称
*   @param {String} description 属性介绍
*   @param {String} threadWarning 文章页顶部公告
* */
schema.statics.getCategoriesById = async (tcId = []) => {
  const ThreadCategoryModel = mongoose.model('threadCategories');
  if(tcId.length === 0) return [];
  const categories = await ThreadCategoryModel.find({}, {
    _id: 1,
    name: 1,
    description: 1,
    threadWarning: 1,
    cid: 1
  });
  const categoriesObj = {};
  for(const category of categories) {
    categoriesObj[category._id] = category;
  }
  const threadCategories = [];
  for(const id of tcId) {
    const node = categoriesObj[id];
    if(!node) continue;
    const category = categoriesObj[node.cid];
    if(!category) continue;
    threadCategories.push({
      categoryId: category._id,
      categoryName: category.name,
      categoryThreadWarning: category.threadWarning,
      nodeId: node._id,
      nodeName: node.name,
      nodeThreadWarning: node.threadWarning
    });
  }
  return threadCategories;
};

/*
* 删除文章属性并清除相关引用
* */
schema.methods.deleteAndClearReference = async function() {
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const DraftModel = mongoose.model('draft');
  const HomeBlockModel = mongoose.model('homeBlocks');
  const nodes = await ThreadCategoryModel.find({cid: this._id});
  const categoriesId = [this._id];
  const homeBlockTcId = [];
  nodes.map(n => {
    categoriesId.push(n._id);
    homeBlockTcId.push(`${this._id}-${n._id}`);
  });
  await ThreadModel.updateMany({
    tcId: {$in: categoriesId}
  }, {
    $pull: {
      tcId: {
        $in: categoriesId
      }
    }
  });
  await PostModel.updateMany({
    tcId: {$in: categoriesId}
  }, {
    $pull: {
      tcId: {
        $in: categoriesId
      }
    }
  });
  await DraftModel.updateMany({
    tcId: {$in: categoriesId}
  }, {
    $pull: {
      tcId: {
        $in: categoriesId
      }
    }
  });
  if(this.cid) {
    const parentNode = await ThreadCategoryModel.findOnly({_id: this.cid});
    homeBlockTcId.push(`${parentNode._id}-${this._id}`);
  } else {
    homeBlockTcId.push(`${this._id}-default`);
  }
  await HomeBlockModel.updateMany({tcId: {$in: homeBlockTcId}},{
    $pull: {
      tcId: {
        $in: homeBlockTcId
      }
    }
  });
  await ThreadCategoryModel.deleteMany({_id: {$in: categoriesId}});
};

module.exports = mongoose.model('threadCategories', schema);

