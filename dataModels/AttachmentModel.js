const settings = require('../settings');
const moment = require("moment");
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fs = require("fs");
const fsPromise = fs.promises;
const statics = require('../settings/statics');
const schema = new Schema({
  _id: String,
  type: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    default: '',
    index: 1,
  },
  path: {
    type: String,
    required: true,
    index: 1,
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  size: {
    type: Number,
    default: 0,
  },
  ext: {
    type: String,
    required: true,
    index: 1
  },
  name: {
    type: String,
    default: '',
  },
  c: {
    type: String,
    default: '',
    index: 1
  }
}, {
  collection: 'attachments'
});

/*
* 获取附件所在文件夹路径
* @param {Boolean} upload true: 获取上传相关路径，false: 获取下载相关路径
* */
schema.statics.getAttachmentPath = async (upload) => {
  const file = require("../nkcModules/file");
  const {attachment} = file.folders;
  if(upload) {
    const timePath = moment().format(`/YYYY/MM`);
    const fullPath = await file.getFullPath(attachment + timePath);
    return {
      fullPath,
      timePath,
    }
  } else {
    return await file.getFullPath(attachment);
  }
}

/*
* 获取新的附件ID
* @return {String} id
* @author pengxiguaa 2020/6/12
* */
schema.statics.getNewId = () => {
  return mongoose.Types.ObjectId().toString();
};

/*
* 保存水印图片
* @param {File} file 水印图片
* @return {Object} 附件对象
* @author pengxiguaa 2020/6/12
* */
schema.statics.saveWatermark = async (file, c = 'normal') => {
  if(!['normal', 'small'].includes(c)) throwErr(400, '未知的水印类型');
  const FILE = require("../nkcModules/file");
  const ext = await FILE.getFileExtension(file, ['jpg', 'png', 'jpeg']);
  const AM = mongoose.model('attachments');
  const SM = mongoose.model('settings');
  const {fullPath, timePath} = await AM.getAttachmentPath(true);
  const aid = AM.getNewId();
  const fileName = `${aid}.${ext}`;
  const savePath = `${timePath}/${fileName}`;
  const realPath = `${fullPath}/${fileName}`;
  const {path, size, name} = file;
  await fsPromise.rename(path, realPath);
  const attachment = AM({
    _id: aid,
    path: savePath,
    size,
    name,
    ext,
    c,
    type: 'watermark',
  });
  await attachment.save();
  const obj = {};
  obj[`c.watermark.${c}AttachId`] = aid;
  await SM.updateOne({_id: 'upload'}, {
    $set: obj
  });
  await SM.saveSettingsToRedis('upload');
  return attachment;
}

/*
* 获取文件在磁盘的真实路径
* @return {String} 磁盘路径
* @author pengxiguaa 2020/6/12
* */
schema.methods.getFilePath = async function() {
  const AP = mongoose.model('attachments');
  const attachmentPath = await AP.getAttachmentPath();
  const {path} = this;
  const filePath = attachmentPath + path;
  if(fs.existsSync(filePath)) {
    return filePath;
  } else {
    throwErr(400, '文件未找到');
  }
}

/*
* 获取水印图片路径
* @return {String} 磁盘路径
* @author pengxiguaa 2020/6/12
* */
schema.statics.getWatermarkFilePath = async (c) => {
  if(!['normal', 'small'].includes(c)) throwErr(400, '未知的水印类型');
  const AP = mongoose.model("attachments");
  const SM = mongoose.model('settings');
  const uploadSettings = await SM.getSettings('upload');
  const id = uploadSettings.watermark[`${c}AttachId`];
  if(!id) {
    return statics[`${c}Watermark`];
  }
  const water = await AP.findById(id);
  return await water.getFilePath();
}

module.exports = mongoose.model('attachments', schema);
