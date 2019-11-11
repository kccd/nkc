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
  // md5
  hash: {
    type: String,
    default: "",
    index: 1
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
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  // 为图片时 图片高度
  height: {
    type: Number,
    index: 1,
    default: null
  },
  // 为图片时 图片宽度
  width: {
    type: Number,
    index: 1,
    default: null
  }
});
/* 
  获取文件路径
*/
resourceSchema.methods.getFilePath = async function() {
  const {selectDiskCharacterDown} = require("../settings/mediaPath");
  const {path} = this;
  let filePath = selectDiskCharacterDown(this);
  filePath += path;
  return filePath;
};



module.exports = mongoose.model('resources', resourceSchema);