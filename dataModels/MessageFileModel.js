const mongoose = require('mongoose');
const PATH = require('path');
const Schema = mongoose.Schema;
const messageFileSchema = new Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  targetUid: {
    type: String,
    required: true,
    index: 1
  },
  path: {
    type: String,
    default: ''
  },
  oname: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  ext: {
    type: 'String',
    required: true
  },
  hits: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: 'messageFiles',
  toObject: {
    getters: true,
    virtuals: true
  }
});

/*
* 获取附件磁盘路径
* */
messageFileSchema.methods.getFilePath = async function(t) {
  const MessageFileModel = mongoose.model('messageFiles');
  const fileType = await MessageFileModel.getFileTypeByExtension(this.ext);
  const fileFolder = await MessageFileModel.getFileFolder(fileType, this.toc);
  const FILE = require('../nkcModules/file');
  const normalPath = PATH.resolve(fileFolder, `./${this._id}.${this.ext}`);
  if(t) {
    const _path = PATH.resolve(fileFolder, `./${this._id}${t?('_' + t):''}.${this.ext}`);
    if(await FILE.access(_path)) return _path;
  }
  return normalPath;
}

/*
* 获取文件目录
* */
messageFileSchema.statics.getFileFolder = async (fileType, toc) => {
  const FILE = require('../nkcModules/file');
  fileType = fileType.split('');
  fileType[0] = fileType[0].toUpperCase();
  fileType = `message` + fileType.join('');
  return await FILE.getPath(fileType, toc);
}

/*
* 根据格式判断文件类型
* */
messageFileSchema.statics.getFileTypeByExtension = async (extension) => {
  const imageExt = ['jpg', 'jpeg', 'bmp', 'svg', 'png', 'gif'];
  const voiceExt = ['amr', 'mp3', 'aac'];
  const videoExt = ["mp4", "mov", "3gp", "avi"];
  if(imageExt.includes(extension)) return 'image';
  if(voiceExt.includes(extension)) return 'voice';
  if(videoExt.includes(extension)) return 'video';
  return 'file';
}

const messageFileModel = mongoose.model('messageFiles', messageFileSchema);
module.exports = messageFileModel;
