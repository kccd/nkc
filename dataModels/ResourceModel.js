const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
	rid: {
    type: String,
    unique: true,
    required: true
  },
  originId: {
    type: String,
    default: ""
  },
  ext: {
    type: String,
    default: ''
  },
  hits: {
    type: Number,
    default: 0
  },
  oname: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tpath: {
    type: String,
    default: ''
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  mediaType: {
    type: String,
    index: 1,
    default: ''
  },
  // pid, 表示哪些post引入了该资源
  references: {
	  type: [String],
    index: 1,
    default: []
  },
  forumsId: {
    type: [String],
    index: 1,
    default: []
  },
  name: {
	  type: String,
    default: ""
  },
  description: {
	  type: String,
    default: ""
  },
  cover: {
	  type: String,
    default: ''
  },
  category: {
	  type: String, // book, paper, program, media
    index: 1,
    default: ""
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  }
});
/*
* 将资源数据推送到搜索数据库
* @param {Object} resource 资源对象
* @author pengxiguaa 2019-10-18
* */
resourceSchema.statics.saveResourceToES = async (rid) => {
  const resource = await mongoose.model("resources").findOne({rid});
  if(!resource) throwErr(500, `resource not found, rid: ${rid}`);
  const elasticSearch = require("../nkcModules/elasticSearch");
  const resourceData = {
    tid: resource.rid,
    t: resource.name || resource.oname,
    c: resource.description,
    toc: resource.tlm || resource.toc,
    mainForumsId: resource.forumsId,
    uid: resource.uid
  };
  await elasticSearch.save("resource", resourceData);
};

/*
* 从搜索数据库中删掉该资源数据
* @param {String} rid 资源ID
* @author pengxiguaa 2019-10-18
* */
resourceSchema.statics.removeFromES = async (rid) => {
  const elasticSearch = require("../nkcModules/elasticSearch");
  await elasticSearch.delete("resource", rid);
};
module.exports = mongoose.model('resources', resourceSchema);