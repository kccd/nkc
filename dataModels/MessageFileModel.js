const mongoose = require('../settings/database');
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
  collection: 'messageFiles'
});


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

messageFileSchema.statics.createMessageFileDataAndPushFile = async (props) => {
  const {
    file,
    isVoice,
    uid,
    targetUid,
  } = props
  const MessageModel = mongoose.model('messages');
  const MessageFileModel = mongoose.model('messageFiles');
  const SettingModel = mongoose.model('settings');
  const FILE = require('../nkcModules/file');
  await MessageModel.checkFileSize(file);
  const ext = await FILE.getFileExtension(file);
  if(['exe', 'bat'].includes(ext)) ctx.throw(403, `暂不支持上传该类型的文件`);
  const type = await MessageFileModel.getFileTypeByExtension(ext, isVoice);
  const mfId = await SettingModel.operateSystemID('messageFiles', 1);
  const time = new Date();
  const messageFile = MessageFileModel({
    _id: mfId,
    toc: time,
    oname: file.name,
    size: file.size,
    type,
    ext,
    uid,
    targetUid,
  });
  messageFile.files = await messageFile.pushToMediaService(file.path);
  await messageFile.save();
  return messageFile;
};

messageFileSchema.methods.pushToMediaService = async function(filePath) {
  const FILE = require('../nkcModules/file');
  const socket = require('../nkcModules/socket');
  const mediaClient = require('../tools/mediaClient');
  const {ext, toc, type, _id, oname} = this;
  let messageFileType = type.split('');
  messageFileType[0] = messageFileType[0].toUpperCase();
  messageFileType = `message` + messageFileType.join('');
  const storeServiceUrl = await FILE.getStoreUrl(toc);
  const mediaServiceUrl = await socket.getMediaServiceUrl();
  const timePath = await FILE.getTimePath(toc);
  const mediaPath = await FILE.getMediaPath(messageFileType);
  const data = {
    mfId: _id,
    timePath,
    mediaPath,
    toc,
    ext,
    disposition: oname,
  };
  const res = await mediaClient(mediaServiceUrl, {
    type: messageFileType,
    filePath,
    storeUrl: storeServiceUrl,
    data
  });
  return res.files;
}

messageFileSchema.methods.getRemoteFile = async function(size) {
  const FILE = require('../nkcModules/file');
  const {_id, toc, type, oname, files} = this;
  const storeUrl = await FILE.getStoreUrl(toc);
  const mediaPath = await FILE.getMediaPath(type);
  const timePath = await FILE.getTimePath(toc);
  const defaultSizeFile = files['def'];
  let targetSizeFile = files[size];
  if(!targetSizeFile || targetSizeFile.lost || !targetSizeFile.filename) {
    targetSizeFile = defaultSizeFile;
  }
  if(!targetSizeFile || targetSizeFile.lost || !targetSizeFile.filename) {
    throw new Error(`message file 数据错误 mfId: ${_id}`);
  }
  const filenamePath = targetSizeFile.filename;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  return {
    url: await FILE.createStoreQueryUrl(storeUrl, time, path),
    filename: targetSizeFile.disposition || oname
  }
};

module.exports = mongoose.model('messageFiles', messageFileSchema);
