const settings = require('../settings');
const ei = require("easyimage");
const moment = require("moment");
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fs = require("fs");
const fsPromise = fs.promises;
const statics = require('../settings/statics');
const FileType = require('file-type');
const FILE = require('../nkcModules/file');
const schema = new Schema({
  // 附件ID mongoose.Types.ObjectId().toString()
  _id: String,
  // 附件类型
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 附件拥有者ID
  uid: {
    type: String,
    default: '',
    index: 1,
  },
  // 附件目录 不包含文件名，如：/avatar/2020/07/
  path: {
    type: String,
    required: true,
    index: 1,
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
  },
  //
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
  const {fullPath, timePath} = await AM.getAttachmentPath();
  const aid = AM.getNewId();
  const fileName = `${aid}.${ext}`;
  const realPath = `${fullPath}/${fileName}`;
  const {path, size, name, hash} = file;
  await fsPromise.rename(path, realPath);
  const attachment = AM({
    _id: aid,
    path: timePath,
    size,
    hash,
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

/**
 * 保存首页大Logo
 * @param {File} file - file对象
 */
schema.statics.saveHomeBigLogo = async file => {
  const FILE = require("../nkcModules/file");
  const ext = (await FileType.fromFile(file.path)).ext;
  const AM = mongoose.model('attachments');
  const SM = mongoose.model('settings');
  const {fullPath, timePath} = await AM.getAttachmentPath();
  const aid = AM.getNewId();
  const fileName = `${aid}.${ext}`;
  const realPath = `${fullPath}/${fileName}`;
  const {path, size, name} = file;
  await fsPromise.rename(path, realPath);
  const attachment = AM({
    _id: aid,
    path: timePath,
    size,
    name,
    ext,
    type: 'homeBigLogo',
    hash: file.hash
  });
  await attachment.save();
  await SM.updateOne({_id: 'home'}, {
    $push: {
      "c.homeBigLogo": aid
    }
  });
  await SM.saveSettingsToRedis('home');
  return attachment;
}

/*
* 获取文件在磁盘的真实路径
* @return {String} 磁盘路径
* @author pengxiguaa 2020/6/12
* */
schema.methods.getFilePath = async function(t) {
  const file = require("../nkcModules/file");
  const {path, _id, ext, toc} = this;
  const {attachment} = file.folders;
  const attachmentPath = await file.getFullPath(attachment, toc);
  const normalFilePath = `${attachmentPath}${path}/${_id}.${ext}`;
  const filePath = `${attachmentPath}${path}/${_id}${t?'_' + t: ''}.${ext}`;

  if(fs.existsSync(filePath)) {
    return filePath;
  } else if(fs.existsSync(normalFilePath)) {
    return normalFilePath;
  } else {
    throwErr(400 , '文件未找到');
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

/**
 * 获取首页大Logo
 */
schema.statics.getHomeBigLogo = async () => {
  const SM = mongoose.model('settings');
  const homeSettings = await SM.getSettings('home');
  if(!homeSettings.homeBigLogo || !(homeSettings.homeBigLogo.length)) {
    return [];
  } else {
    return homeSettings.homeBigLogo;
  }
}
/*
* 保存专业Logo
* @param {File} file 文件对象
* @return {Object} attachment对象
* @author pengxiguaa 2020/6/18
* */
schema.statics.saveForumImage = async (fid, type, file) => {
  if(!['logo', 'banner'].includes(type)) throwErr(400, '未知的图片类型');
  type = {
    'logo': 'Logo',
    'banner': 'Banner'
  }[type];
  const AM = mongoose.model("attachments");
  const ForumModel = mongoose.model('forums');
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['jpg', 'jpeg', 'png']);
  const {fullPath, timePath} = await AM.getAttachmentPath();
  const aid = AM.getNewId();
  const fileName = `${aid}.${ext}`;
  const targetFilePath = `${fullPath}/${fileName}`;
  const {size, name, hash} = file;
  const attachment = AM({
    _id: aid,
    size,
    hash,
    name,
    type: `forum${type}`,
    ext,
    path: timePath
  });
  await attachment.save();
  if(type === 'Logo') {
    // 正常
    await ei.resize({
      src: file.path,
      dst: targetFilePath,
      height: 192,
      width: 192,
      quality: 90
    });
    // 大图
    const targetFilePathLG = `${fullPath}/${aid}_lg.${ext}`;
    await ei.resize({
      src: file.path,
      dst: targetFilePathLG,
      height: 600,
      width: 600,
      quality: 90
    });
    // 小图
    const targetFilePathSM = `${fullPath}/${aid}_sm.${ext}`;
    await ei.resize({
      src: file.path,
      dst: targetFilePathSM,
      height: 48,
      width: 48,
      quality: 90
    });
    await ForumModel.updateOne({fid}, {
      $set: {
        logo: aid
      }
    });
  } else {
    await ei.resize({
      src: file.path,
      dst: targetFilePath,
      height: 300,
      width: 1200,
      quality: 90
    });
    await ForumModel.updateOne({fid}, {
      $set: {
        banner: aid
      }
    })
  }
  return attachment;
};
/*
* 保存积分的图标
* @param {File} file 图片文件
* @param {String} scoreType 积分类型
* @return {Object} attachment object
* @author pengxiguaa 2020/6/22
* */
schema.statics.saveScoreIcon = async (file, scoreType) => {
  const AttachmentModel = mongoose.model('attachments');
  const SettingModel = mongoose.model('settings');
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['png', 'jpg', 'jpeg']);
  const aid = AttachmentModel.getNewId();
  const {fullPath, timePath} = await AttachmentModel.getAttachmentPath();
  const {size, name, path, hash} = file;
  await ei.resize({
    src: path,
    dst: `${fullPath}/${aid}.png`,
    height: 128,
    width: 128,
    quality: 90
  });
  await ei.resize({
    src: path,
    dst: `${fullPath}/${aid}_sm.png`,
    height: 48,
    width: 48,
    quality: 90
  });
  const attachment = AttachmentModel({
    _id: aid,
    name,
    size,
    ext,
    hash,
    path: timePath,
    type: 'scoreIcon'
  });
  await attachment.save();
  const scores = await SettingModel.getScores();
  for(const score of scores) {
    if(score.type === scoreType) {
      score.icon = aid;
      break;
    }
  }
  await SettingModel.updateOne({_id: 'score'}, {
    $set: {
      'c.scores': scores
    }
  });
  await SettingModel.saveSettingsToRedis('score');
  return attachment;
};

/*
* 保存文章封面
*
* */
schema.statics.savePostCover = async (file, post) => {
  const now = Date.now();
  const targetFilePath = await FILE.getPath('postCover', now);

};

module.exports = mongoose.model('attachments', schema);
