const mongoose = require('mongoose');
const PATH = require('path');
const Schema = mongoose.Schema;
const messageFileSchema = new Schema({
  _id: Number,
  // 文件类型 video, audio, voice, image, file
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 发送者
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 接受者
  targetUid: {
    type: String,
    required: true,
    index: 1
  },
  // 文件名称
  oname: {
    type: String,
    required: true
  },
  // 文件大小
  size: {
    type: Number,
    required: true
  },
  // 文件格式
  ext: {
    type: String,
    index: 1,
    required: true
  },
  // 文件访问量
  hits: {
    type: Number,
    default: 0
  },
  // 音频或视频的时间长度 (ms)
  duration: {
    type: Number,
    default: 0,
  },
  // 当前数据创建时间 文件上传时间
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
* image/video/audio/voice/file
* @param {String} extension 文件格式
* @param {Boolean} isVoice 是否指定为音频文件
* @return {String}
* */
messageFileSchema.statics.getFileTypeByExtension = async (extension, isVoice = false) => {
  const imageExt = ['jpg', 'jpeg', 'bmp', 'svg', 'png', 'gif'];
  const voiceExt = ['amr', 'mp3', 'aac'];
  const audioExt = ['mp3', 'aac', 'wav'];
  const videoExt = ["mp4", "mov", "3gp", "avi"];
  if(isVoice) {
    if(voiceExt.includes(extension)) return 'voice';
  } else {
    if(imageExt.includes(extension)) return 'image';
    if(audioExt.includes(extension)) return 'audio';
    if(videoExt.includes(extension)) return 'video';
  }
  return 'file';
}

const messageFileModel = mongoose.model('messageFiles', messageFileSchema);
module.exports = messageFileModel;
