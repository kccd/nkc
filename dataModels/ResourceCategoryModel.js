const settings = require('../settings');
const mongoose = settings.database;
const schema = new mongoose.Schema({
  _id: String,
  //创建人uid
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  // 素材创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  //分类名称
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 素材最后修改时间
  tlm: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0,
    index: 1
  }
}, {
  toObject: {
    getters: true,
    virtuals: true
  }
});

schema.virtual('count')
  .get(function() {
    return this._count;
  })
  .set(function(val) {
    return this._count = val
  });

/*
*  拓展出分类包含的资源数量count
* */
schema.statics.extendCount = async function(categories) {
  const ResourcesModel = mongoose.model('resources');
  const _categories = [];
  for(const category of categories) {
    if(!category) return;
    const count = await ResourcesModel.countDocuments({del: false, cid: category._id, type: 'resource'});
    category.count = count;
    const m = category.toObject();
    _categories.push(m);
  }
  return _categories;
}

module.exports = mongoose.model('resourceCategory', schema);
