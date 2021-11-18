const mongoose = require('../settings/database');
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
  },
  files: {
    def: Schema.Types.Mixed,
    cover: Schema.Types.Mixed,
    sm: Schema.Types.Mixed,
    /*
    {
      ext: String,
      lost: String, // 是否已丢失
      hash: String, // 文件 md5
      size: Number, // 文件大小
      height: Number, // 图片、视频高
      width: Number,  // 图片、视频宽
      filename: String, // 在存储服务磁盘上的文件名
      disposition: String, // 下载时显示的名称
    }
    */
  },
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
  const audioExt = ['mp3', 'aac', 'wav', 'flac'];
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

/*
* 根据文件类型获取文件夹类型
* @param {String} type 文件类型
* @return {String}
* */
messageFileSchema.statics.getFolderTypeByType = (type) => {
  let messageFileType = type.split('');
  messageFileType[0] = messageFileType[0].toUpperCase();
  return `message` + messageFileType.join('');
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
  const MessageFileModel = mongoose.model('messageFiles');
  const {ext, toc, type, _id, oname} = this;
  const folderType = await MessageFileModel.getFolderTypeByType(type);
  const storeServiceUrl = await FILE.getStoreUrl(toc);
  const mediaServiceUrl = await socket.getMediaServiceUrl();
  const timePath = await FILE.getTimePath(toc);
  const mediaPath = await FILE.getMediaPath(folderType);
  const data = {
    mfId: _id,
    timePath,
    mediaPath,
    toc,
    ext,
    disposition: oname,
  };
  const res = await mediaClient(mediaServiceUrl, {
    type: folderType,
    filePath,
    storeUrl: storeServiceUrl,
    data
  });
  return res.files;
}

messageFileSchema.methods.getRemoteFile = async function(size = 'def') {
  const FILE = require('../nkcModules/file');
  const {_id, ext, toc, type, oname, files = {}} = this;
  const MessageFileModel = mongoose.model('messageFiles');
  const folderType = await MessageFileModel.getFolderTypeByType(type);
  return await FILE.getRemoteFile({
    id: _id,
    toc,
    ext,
    type: folderType,
    name: oname,
    file: files[size] || files['def']
  });
};

messageFileSchema.methods.updateFilesInfo = async function() {
  const FILE = require('../nkcModules/file');
  const {toc, type, _id, ext} = this;
  let filenames;
  if(type === 'image') {
    filenames = {
      def: `${_id}.${ext}`,
      sm: `${_id}_sm.${ext}`
    };
  } else if(type === 'audio') {
    filenames = {
      def: `${_id}.mp3`
    };
  } else if(type === 'voice') {
    filenames = {
      def: `${_id}.mp3`
    };
  } else if(type === 'video') {
    filenames = {
      def: `${_id}.mp4`,
      cover: `${_id}_cover.jpg`
    };
  } else {
    filenames = {
      def: `${_id}.${ext}`
    }
  }
  const files = await FILE.getStoreFilesInfoObj(toc, type, filenames);
  await this.updateOne({
    $set: {
      files
    }
  });
};

module.exports = mongoose.model('messageFiles', messageFileSchema);
