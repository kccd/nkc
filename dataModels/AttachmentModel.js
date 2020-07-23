const settings = require('../settings');
const ei = require("easyimage");
const moment = require("moment");
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fs = require("fs");
const fsPromise = fs.promises;
const statics = require('../settings/statics');
const FileType = require('file-type');
const PATH = require('path');
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
  // 附件目录 不包含文件名
  path: {
    type: String,
    default: '',
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
  const toc = new Date();
  const fileFolder = await FILE.getPath('watermark', toc);
  const aid = AM.getNewId();
  const fileName = `${aid}.${ext}`;
  const realPath = PATH.resolve(fileFolder, `./${fileName}`);
  const {path, size, name, hash} = file;
  await fsPromise.rename(path, realPath);
  const attachment = AM({
    _id: aid,
    toc,
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
  const toc = new Date();
  const fileFolder = await FILE.getPath('homeBigLogo', toc);
  const aid = AM.getNewId();
  const fileName = `${aid}.${ext}`;
  const realPath = PATH.resolve(fileFolder, `./${fileName}`);
  const {path, size, name} = file;
  await fsPromise.rename(path, realPath);
  const attachment = AM({
    _id: aid,
    toc,
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
  const {_id, ext, toc, type} = this;
  const fileFolderPath = await file.getPath(type, toc);
  const normalFilePath = PATH.resolve(fileFolderPath, `./${_id}.${ext}`);
  const filePath = PATH.resolve(fileFolderPath, `./${_id}${t?'_'+t:''}.${ext}`);

  if(fs.existsSync(filePath)) {
    return filePath;
  } else if(fs.existsSync(normalFilePath)) {
    return normalFilePath;
  } else {
    // 为了兼容测试环境（访问时因无图导致大量报错）
    if(global.NKC.NODE_ENV === 'production') {
      throwErr(400 , '文件未找到');
    } else {
      return '';
    }
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
  if(!['forumLogo', 'forumBanner'].includes(type)) throwErr(400, '未知的图片类型');
  const AM = mongoose.model("attachments");
  const ForumModel = mongoose.model('forums');
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['jpg', 'jpeg', 'png']);
  const toc = new Date();
  const fileFolder = await FILE.getPath(type, toc)
  const {fullPath, timePath} = await AM.getAttachmentPath();
  const aid = AM.getNewId();
  const fileName = `${aid}.${ext}`;
  const targetFilePath = PATH.resolve(fileFolder, `./${fileName}`);
  const {size, name, hash} = file;
  const attachment = AM({
    _id: aid,
    toc,
    size,
    hash,
    name,
    type,
    ext,
  });
  await attachment.save();
  if(type === 'forumLogo') {
    // 正常
    await ei.resize({
      src: file.path,
      dst: targetFilePath,
      height: 192,
      width: 192,
      quality: 90
    });
    // 大图
    const targetFilePathLG = PATH.resolve(fileFolder, `./${aid}_lg.${ext}`);
    await ei.resize({
      src: file.path,
      dst: targetFilePathLG,
      height: 600,
      width: 600,
      quality: 90
    });
    // 小图
    const targetFilePathSM = PATH.resolve(fileFolder, `./${aid}_sm.${ext}`);
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
  const toc = new Date();
  const fileFolder = await FILE.getPath('scoreIcon', toc);
  const {size, name, path, hash} = file;
  await ei.resize({
    src: path,
    dst: PATH.resolve(fileFolder, `./${aid}.png`),
    height: 128,
    width: 128,
    quality: 90
  });
  await ei.resize({
    src: path,
    dst: PATH.resolve(fileFolder, `./${aid}_sm.png`),
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
    toc,
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
* @param {String} pid post id
* @param {File} file 文件对象 可选 默认从post resources中选取图片
* @author pengxiguaa 2020/7/21
* */
schema.statics.savePostCover = async (pid, file) => {
  const PostModel = mongoose.model('posts');
  const ResourceModel = mongoose.model('resources');
  const FILE = require('../nkcModules/file');
  if(file === undefined) {
    const post = await PostModel.findOne({pid});
    if(!post) return;
    const extArr = ['jpg', 'jpeg', 'png'];
    const cover = await ResourceModel.findOne({ext: {$in: extArr}, references: pid});
    if(!cover) return;
    const filePath = await cover.getFilePath();
    if(!fs.existsSync(filePath)) return;
    file = await FILE.getFileObjectByFilePath(filePath);
  }
  const AttachmentModel = mongoose.model('attachments');
  const {size, hash, path, name} = file;
  const now = Date.now();
  const _id = await AttachmentModel.getNewId();
  const targetFileFolder = await FILE.getPath('postCover', now);
  const ext = 'jpg';
  const targetFilePath = PATH.resolve(targetFileFolder, `./${_id}.${ext}`)
  const a = AttachmentModel({
    _id,
    type: 'postCover',
    toc: now,
    size,
    hash,
    ext,
    name
  });
  await ei.resize({
    src: path,
    dst: targetFilePath,
    height: 400,
    width: 800,
    background: '#ffffff',
    quality: 90
  });
  await a.save();
  await PostModel.updateOne({pid}, {
    $set: {
      cover: _id,
    }
  });
};

/*
* 保存首页推荐文章封面
* @param {File} File 文件对象
* @param {String} type 图片类型 movable: 轮播图, fixed: 固定图
* @return {String} 附件对象ID
* @author pengxiguaa 2020/7/21
* */
schema.statics.saveRecommendThreadCover = async (file, type) => {
  const AttachmentModel = mongoose.model('attachments');
  const {hash, path, size, name} = file;
  const FILE = require('../nkcModules/file');
  const toc = new Date();
  const t = 'recommendThreadCover';
  const fileFolder = await FILE.getPath(t, toc);
  const aid = await AttachmentModel.getNewId();
  const ext = 'jpg';
  const filePath = PATH.resolve(fileFolder, `./${aid}.${ext}`);
  let height = 253, width = 400;
  if(type === 'movable') {
    height = 336;
    width = 800;
  }
  await ei.resize({
    src: path,
    dst: filePath,
    height,
    width,
    quality: 90
  });
  const a = AttachmentModel({
    _id: aid,
    toc,
    ext,
    type: t,
    name,
    size,
    hash
  });
  await a.save();
  return aid;
};


module.exports = mongoose.model('attachments', schema);
