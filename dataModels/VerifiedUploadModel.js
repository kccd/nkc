const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const folderTools = require("../nkcModules/file");
const PATH = require('path');

const schema = new Schema({
  // 附件ID mongoose.Types.ObjectId().toString()
  _id: String,
  // 上传者ID
  uid: {
    type: String,
    default: '',
    index: 1,
  },
  // 附件类型
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 附件大小
  size: {
    type: Number,
    default: 0,
  },
  // 附件格式
  ext: {
    type: String,
    required: true,
    index: 1
  },
  // 附件原文件名
  name: {
    type: String,
    default: '',
  },
  // 附件hash
  hash: {
    type: String,
    index: 1,
    default: ''
  }
}, {
  collection: 'verifiedUpload'
});

/*
* 获取文件夹路径
* @param {Date} t 指定時間
* */
schema.statics.getAttachmentPath = async (t) => {
  const file = require("../nkcModules/file");
  const {attachment} = file.folders;
  t = t || new Date();
  const timePath = moment(t).format(`/YYYY/MM`);
  const fullPath = await file.getFullPath(attachment + timePath, t);
  return {
    fullPath,
    timePath,
  };
}

/*
* 获取文件在磁盘的真实路径
* @return {String} 磁盘路径
* @author pengxiguaa 2020/6/12
* */
schema.methods.getFilePath = async function(t) {
  const file = require("../nkcModules/file");
  const {_id, ext, toc, type} = this;
  const fileFolderPath = await file.getPath(type, toc);
  const normalFilePath = PATH.resolve(fileFolderPath, `./${_id}.${ext}`);
  const filePath = PATH.resolve(fileFolderPath, `./${_id}${t?'_'+t:''}.${ext}`);

  if(await file.access(filePath)) {
    return filePath;
  } else if(await file.access(normalFilePath)) {
    return normalFilePath;
  } else {
    return '';
  }
}

/*
* 获取新的附件ID
* @return {String} id
* */
schema.statics.getNewId = () => {
  return mongoose.Types.ObjectId().toString();
};

module.exports = mongoose.model('verifiedUpload', schema);