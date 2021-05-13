const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  type: { // 分类的类型。"": 普通分类，可编辑可删除, "post": 我发表的，不可删除, "replay": 我参与的，不可删除
    type: String,
    index: 1,
    default: ""
  },
  name: {
    type: String,
    required: true
  },
  abbr: {
    type: String,
    default: ""
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  pid: {
    type: Number,
    default: null,
    index: 1
  },
  count: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 1,
    index: 1
  }
});
/*
* 更新分类中关注的条数
* @param {[Number]} subscribeTypesId 分类ID数组
* @author pengxiguaa 2019-7-19
* */
schema.statics.updateCount = async (subscribeTypesId) => {
  const SubscribeModel = mongoose.model("subscribes");
  const SubscribeTypeModel = mongoose.model("subscribeTypes");
  for(const id of subscribeTypesId) {
    const type = await SubscribeTypeModel.findOne({_id: id});
    if(!type) continue;
    const count = await SubscribeModel.countDocuments({cancel: false, cid: id});
    await type.updateOne({count});
  }
};
/*
* 获取分类树状结构
* */
schema.statics.getTypesTree = async (uid) => {
  const SubscribeTypeModel = mongoose.model("subscribeTypes");
  const types_ = await SubscribeTypeModel.find({uid}).sort({order: 1});
  const types = [];
  const typesObj = {};
  for(const t of types_) {
    const type = t.toObject();
    type.childTypes = [];
    typesObj[type._id] = type;
    types.push(type);
  }
  const results = [];
  for(const type of types) {
    if(!type.pid) {
      results.push(type);
    } else {
      const parentType = typesObj[type.pid];
      if(parentType) parentType.childTypes.push(type);
    }
  }
  return results;
};
/*
* 获取分类平级结构 level字段表层级关系
* */
schema.statics.getTypesList = async (uid) => {
  const types = await mongoose.model("subscribeTypes").getTypesTree(uid);
  const results = [];
  let postType, replayType;
  for(const type of types) {
    const childTypes = type.childTypes || [];
    delete type.childTypes;
    results.push(type);
    for(const t of childTypes) {
      results.push(t);
    }
  }
  return results;
};
module.exports = mongoose.model("subscribeTypes", schema);