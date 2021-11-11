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
const folderTools = require("../nkcModules/file");
const ffmpeg = require("../tools/ffmpeg")

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
  await fsPromise.copyFile(path, realPath);
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
  await fsPromise.copyFile(path, realPath);
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


/**
 * 保存网站图标
 * @param {File} file - file对象
 */
schema.statics.saveSiteIcon = async file => {
  const FILE = require("../nkcModules/file");
  const ext = await FILE.getFileExtension(file, ["ico", 'jpg', 'jpeg', 'png']);
  const AM = mongoose.model('attachments');
  const SM = mongoose.model('settings');
  const toc = new Date();
  const fileFolder = await FILE.getPath('siteIcon', toc);
  const aid = AM.getNewId();
  const fileName = `${aid}.png`;
  const fileNameSM = `${aid}_sm.png`;
  const fileNameLG = `${aid}_lg.png`;
  const fileNameICO = `${aid}.ico`;
  const realPath = PATH.resolve(fileFolder, `./${fileName}`);
  const realPathSM = PATH.resolve(fileFolder, `./${fileNameSM}`);
  const realPathLG = PATH.resolve(fileFolder, `./${fileNameLG}`);
  const realPathICO = PATH.resolve(fileFolder, `./${fileNameICO}`);
  const {path, size, name} = file;

  // 生成ico图标
  await ei.resize({
    src: path,
    dst: realPathICO,
    height: 96,
    width: 96,
  });
  // 生成小logo
  await ei.resize({
    src: path,
    dst: realPathSM,
    height: 128,
    width: 128
  });
  // 生成中等logo
  await ei.resize({
    src: path,
    dst: realPath,
    height: 256,
    width: 256,
  });
  // 生成中等logo
  await ei.resize({
    src: path,
    dst: realPathLG,
    height: 512,
    width: 512,
  });

  const attachment = AM({
    _id: aid,
    toc,
    size,
    name,
    ext: 'png',
    type: 'siteIcon',
    hash: file.hash
  });
  await attachment.save();
  await SM.updateOne({_id: 'server'}, {
    "c.siteIcon": aid
  });
  await SM.saveSettingsToRedis('server');
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

  if(await file.access(filePath)) {
    return filePath;
  } else if(await file.access(normalFilePath)) {
    return normalFilePath;
  } else {
    return '';
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
  //判断如果用户未上传水印图片就换未默认图片
  if(!id) {
    return statics[`${c}Watermark`];
  }
  let water = await AP.findById(id);
 //判断如果用户上传了图片根据id找不到图片就替换为默认图片
  if(water == null){
    return statics[`${c}Watermark`];
  }
  let filePath =  await water.getFilePath();
  //判断如果用户上传了图片找不到图片路径就替换为默认图片
  if(!filePath){
    return statics[`${c}Watermark`];
  }
  return filePath;
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

/**
 * 获取网站图标附件ID
 */
schema.statics.getSiteIconFilePath = async (t) => {
  const AttachmentModel = mongoose.model('attachments');
  const SM = mongoose.model('settings');
  const serverSettings = await SM.getSettings('server');
  const attachId = serverSettings.siteIcon;
  const FILE = require('../nkcModules/file');
  const attachment = await AttachmentModel.findOne({_id: attachId});
  if(!attachment) {
    return PATH.resolve(__dirname, `../public/statics/site/favicon.ico`);
  }
  const {type, toc, _id, ext} = attachment;
  const fileFolderPath = await FILE.getPath(type, toc);
  const defaultFilePath = PATH.resolve(fileFolderPath, `./${_id}.${ext}`);
  let filePath;
  if(t === 'ico') {
    filePath = PATH.resolve(fileFolderPath, `./${_id}.ico`);
  } else if(t === 'sm') {
    filePath = PATH.resolve(fileFolderPath, `./${_id}_sm.${ext}`);
  } else if(t === 'lg') {
    filePath = PATH.resolve(fileFolderPath, `./${_id}_lg.${ext}`);
  }
  if(!filePath || !await FILE.access(filePath)) {
    filePath = defaultFilePath;
  }
  return filePath;
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
    if(!await FILE.access(filePath)) return;
    // if(!fs.existsSync(filePath)) return;
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

/*
* 修改draft的封面图
* @param {String} did draftID
* @param {File} 图片数据
* @author pengxiguaa 2020-8-3
* */
schema.statics.saveDraftCover = async (did, file) => {
  const DraftModel = mongoose.model('draft');
  const AttachmentModel = mongoose.model('attachments');
  const draft = await DraftModel.findOne({did});
  const {path, name} = file;
  const ext = 'jpg';
  const FILE = require('../nkcModules/file');
  if(!draft) return;
  const toc = new Date();
  const fileFolder = await FILE.getPath('postCover', toc);
  const aid = await AttachmentModel.getNewId();
  const filePath = PATH.resolve(fileFolder, `./${aid}.${ext}`);
  await ei.resize({
    src: path,
    dst: filePath,
    height: 400,
    width: 800,
    background: "#ffffff",
    quality: 90
  });
  const {hash, size} = await FILE.getFileObjectByFilePath(filePath);
  const a = AttachmentModel({
    _id: aid,
    ext,
    hash,
    size,
    name,
    type: 'postCover'
  });
  await a.save();
  await draft.updateOne({cover: aid});
};

schema.statics.saveProblemImages = async (_id, files = []) => {
  const ProblemModel = mongoose.model('problems');
  const AttachmentModel = mongoose.model('attachments');
  const FILE = require('../nkcModules/file');
  const problem = await ProblemModel.findOne({_id});
  if(!problem) throwErr(500, `图片保存失败`);
  let attachId = [];
  for(const file of files) {
    let ext;
    try{
      ext = await FILE.getFileExtension(file, ['jpg', 'jpeg', 'png']);
    } catch(err) {
      continue;
    }
    const _id = await AttachmentModel.getNewId();
    const {size, hash, name, path} = file;
    const toc = new Date();
    const fileFolder = await FILE.getPath('problemImage', toc);
    const filePath = PATH.resolve(fileFolder, `./${_id}.${ext}`);
    const filePathSM = PATH.resolve(fileFolder, `./${_id}_sm.${ext}`);
    const a = AttachmentModel({
      toc,
      _id,
      ext,
      hash,
      size,
      name,
      type: 'problemImage'
    });
    await a.save();
    await ei.resize({
      src: path,
      dst: filePathSM,
      height: 200,
      width: 200,
      background: "#ffffff",
      quality: 90
    });
    await fsPromise.copyFile(path, filePath);
    await fsPromise.unlink(path);
    attachId.push(_id);
  }
  await problem.updateOne({attachId});
};

/**
 * 身份认证材料存储
 * @returns {string} 附件id
 */
 schema.statics.saveVerifiedUpload = async ({ size, hash, name, path, uid, toc }) => {
  const VerifiedUploadModel = mongoose.model("verifiedUpload");
  const _id = await VerifiedUploadModel.getNewId();
  const ext = PATH.extname(name).substring(1);
  const date = toc || new Date();
  const attachment = VerifiedUploadModel({
    _id,
    toc: date,
    size,
    hash,
    name,
    ext,
    uid,
    type: "verifiedUpload"
  });
  await attachment.save();
  const dir = await folderTools.getPath("verifiedUpload", date);
  const savePath = PATH.join(dir, `${_id}${PATH.extname(name)}`);
  await fs.promises.copyFile(path, savePath);
  return _id;
}

/*
* 保存基金项目的图片
* @param {String} filePath 图片的路径
* @param {String} type 图片的类型 fundAvatar, fundBanner
* @return {String} 附件ID
* */
schema.statics.saveFundImage = async (filePath, type) => {
  const AttachmentModel = mongoose.model('attachments');
  const FILE = require('../nkcModules/file');
  if(!['fundAvatar', 'fundBanner'].includes(type)) throw new Error(`fund image type error`);
  const {size, name, hash} = await FILE.getFileObjectByFilePath(filePath);
  const aid = await AttachmentModel.getNewId();
  const toc = new Date();
  const fileFolder = await FILE.getPath(type, toc);
  const ext = 'jpg';
  const targetFilePath = PATH.resolve(fileFolder, `./${aid}.${ext}`);
  const imageSize = type === 'fundAvatar'? [600, 300]: [1500, 250]
  const attach = AttachmentModel({
    _id: aid,
    toc,
    size,
    hash,
    name,
    type,
    ext
  });
  await ei.resize({
    src: filePath,
    dst: targetFilePath,
    height: imageSize[1],
    width: imageSize[0],
    quality: 90
  });
  await attach.save();
  return attach._id;
}

schema.methods.getRemoteFile = async function(size) {
  const FILE = require('../nkcModules/file');
  const {_id, ext, toc, type, name} = this;
  const diskPath = await FILE.getDiskPath(toc);
  const mediaPath = await FILE.getMediaPath(type);
  const timePath = await FILE.getTimePath(toc);
  let filenamePath;
  if(size) {
    filenamePath = `${_id}_${size}.${ext}`;
  } else {
    filenamePath = `${_id}.${ext}`;
  }
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  return {
    url: diskPath,
    query: {
      path,
      time
    },
    filename: name
  }
}

module.exports = mongoose.model('attachments', schema);
