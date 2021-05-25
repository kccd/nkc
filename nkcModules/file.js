const ei = require("easyimage");
const FileType = require('file-type');
const {upload, statics} = require("../settings");
const fsSync = require("../nkcModules/fsSync");
const fs = require("fs");
const fsPromise = fs.promises;
const db = require("../dataModels");
const mime = require('mime');
const moment = require('moment');
const PATH = require('path');
const attachmentConfig = require("../config/attachment.json");
const mkdirp = require("mkdirp");

const pictureExtensions = ["jpg", "jpeg", "png", "bmp", "svg", "gif", "webp"];
const videoExtensions = ["mp4", "mov", "3gp", "avi", 'webm'];
const audioExtensions = ["wav", "amr", "mp3", "aac", 'flac'];
const breakpointExtensions = ['mp4', 'mp3', 'pdf'];

const func = module.exports;

exports.folders = {
  attachment: './attachment',
  resource: './resource',
}

/*
* 根据时间和配置文件获取资源所磁盘位置
* 配置文件数据格式:
* [
*   {
*      path: '路径2',
*      startingTime: '1990-01-01',
*      endTime: '2010-01-01'
*   },
*   {
*      path: '路径2',
*      startingTime: '2010-01-01',
*      endTime: '2030-01-01'
*   }
* ]
* @param {Date} t 时间，默认为当前时间
* @return {String} 路径
* */
exports.getBasePath = async (t) => {
  let now;
  if(t) {
    now = new Date(t).getTime();
  } else {
    now = Date.now();
  }
  if(!attachmentConfig.length) {
    return PATH.resolve(__dirname, '../resources');
  }
  let basePath;
  for(const a of attachmentConfig) {
    const {path, startingTime, endTime} = a;
    const _path = PATH.resolve(path);
    if(!await func.access(path)) throwErr(500, `指定的目录 ${path} 不存在`);
    // if(!fs.existsSync(path)) throwErr `指定的目录 ${path} 不存在`;
    const sTime = new Date(startingTime + ' 00:00:00').getTime();
    const eTime = new Date(endTime + ' 00:00:00').getTime();
    if(now >= sTime && now < eTime) {
      basePath = _path;
      break;
    }
  }
  if(!basePath) throwErr `未找到指定的目录，请检查目录配置是否正确`;
  return basePath;
}

exports.getFullPath = async (p, t) => {
  const path = PATH.resolve(await func.getBasePath(t), p);
  await mkdirp(path);
  return path;
};

/*
* 根据附件类型和时间获取附件目录，用于存储和获取附件
* @param {String} type 文件类型 如：userAvatar、userBanner 详情看/settings/fileFolder.js
* @param {Date/undefined} time 指定的时间，默认取当前时间
* @return {String} 完成目录
* */
exports.getPath = async (type, time) => {
  const _path = await func.getFileFolderPathByFileType(type);
  if(!_path) throwErr(500, `文件类型错误 type: ${type}`);
  time = time || new Date();
  const file = require('../nkcModules/file');
  const timePath = moment(time).format(`/YYYY/MM`);
  return await file.getFullPath(_path + timePath, time);
};
/*
* 获取指定类型附件所在的文件夹目录 不包含年月
* @param {String} type 附件类型
* @return {String} 路劲
* @author pengxiguaa 2020/7/20
* */
exports.getFileFolderPathByFileType = async (type) => {
  const fileFolder = require('../settings/fileFolder');
  return fileFolder[type];
}

/*
* 获取附件的类型 picture, video, audio, attachment
* */
exports.getMediaTypeByExtension = (extension) => {
  if(pictureExtensions.includes(extension)) {
    return 'mediaPicture'
  } else if(videoExtensions.includes(extension)) {
    return 'mediaVideo'
  } else if(audioExtensions.includes(extension)) {
    return 'mediaAudio'
  } else {
    return 'mediaAttachment'
  }
};
/*
* 获取制定类型的文件格式
* */
exports.getExtensionByType = (type) => {
  if(type === 'mediaPicture') {
    return pictureExtensions;
  } else if(type === 'mediaVideo') {
    return videoExtensions;
  } else if(type === 'mediaAudio') {
    return audioExtensions;
  } else if(type === 'breakpoint') {
    return breakpointExtensions;
  }
  return []
}

/**
 * 存储专栏头像2.0
 * @param {File} file node File对象
 */
func.saveColumnAvatar$2 = async (columnId, file) => {
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = (await FileType.fromFile(file.path)).ext;
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  const column = await db.ColumnModel.findOnly({_id: columnId});
  const AM = db.AttachmentModel;
  const toc = new Date();
  const fileFolder = await func.getPath('columnAvatar', toc)
  const aid = AM.getNewId();
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}_sm.${ext}`), 100);
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}.${ext}`), 250);
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}_lg.${ext}`), 500);
  const attachment = AM({
    _id: aid,
    toc,
    size: file.size,
    name: file.name,
    ext,
    type: 'columnAvatar',
    hash: file.hash,
    uid: column.uid
  });
  await attachment.save();
  await column.updateOne({avatar: aid});
  const imgTypes = ["columnAvatar", "columnAvatarSM", "columnAvatarLG"];
  for(const imgType of imgTypes) {
    const log = await db.ImageLogModel({
      uid: column.uid,
      columnId: columnId,
      imgType,
      imgId: aid,
      type: "columnChangeAvatar"
    });
    await log.save();
  }
  await fsSync.unlink(file.path);
  return aid;
}


// 删除专栏头像文件
exports.deleteColumnAvatar = async (columnId) => {
  const column = await db.ColumnModel.findOnly({_id: columnId});
  await column.updateOne({avatar: ""});
};

/**
 * 保存专栏背景2.0
 * @param {string} columnId 专栏id
 * @param {File} file node 文件对象
 */
func.saveColumnBanner$2 = async (columnId, file) => {
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = (await FileType.fromFile(file.path)).ext;
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  const column = await db.ColumnModel.findOnly({_id: columnId});
  const AM = db.AttachmentModel;
  const toc = new Date();
  const fileFolder = await func.getPath('columnBanner', toc);
  const aid = AM.getNewId();
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}_sm.${ext}`), 720, 1280);
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}.${ext}`), 480, 1920);
  const attachment = AM({
    _id: aid,
    toc,
    size: file.size,
    name: file.name,
    ext,
    type: 'columnBanner',
    hash: file.hash,
    uid: column.uid
  });
  await attachment.save();
  await column.updateOne({banner: aid});
  const imgTypes = ["columnBanner", "columnBannerSM"];
  for(const imgType of imgTypes) {
    const log = await db.ImageLogModel({
      uid: column.uid,
      columnId: columnId,
      imgType,
      imgId: aid,
      type: "columnChangeBanner"
    });
    await log.save();
  }
  await fsSync.unlink(file.path);
  return aid;
}


// 删除专栏背景文件
exports.deleteColumnBanner = async (columnId) => {
  const column = await db.ColumnModel.findOnly({_id: columnId});
  await column.updateOne({banner: ""});
};

/**
* 保存用户头像2.0
* 保存到附件中
* @param {String} uid 用户ID
* @param {File} file 文件对象
 */
func.saveUserAvatar$2 = async (uid, file) => {
  const AM = db.AttachmentModel;
  const user = await db.UserModel.findOnly({uid});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = await func.getFileExtension(file, ['png', 'jpg', 'jpeg']);
  const now = new Date;
  const fileFolder = await func.getPath('userAvatar', now);
  const aid = AM.getNewId();
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}.${ext}`), 192);
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}_sm.${ext}`), 48);
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}_lg.${ext}`), 600);
  const attachment = AM({
    _id: aid,
    toc: now,
    size: file.size,
    name: file.name,
    hash: file.hash,
    ext,
    type: 'userAvatar',
    uid,
  });
  await attachment.save();
  await user.updateOne({avatar: aid});
  return attachment;
}


/*
* 删除用户头像
* @param {String} uid 用户ID
* @author pengxiguaa 2019-8-2
* */
exports.deleteUserAvatar = async (uid) =>{
  const user = await db.UserModel.findOnly({uid});
  await user.updateOne({avatar: ""});
};


/**
* 保存用户背景2.0
* 作为附件存储
* @param {String} uid 用户ID
* @param {File} file 文件对象
*/
func.saveUserBanner$2 = async (uid, file) => {
  const AM = db.AttachmentModel;
  const user = await db.UserModel.findOnly({uid});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = (await FileType.fromFile(file.path)).ext;
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  const now = new Date;
  const fileFolder = await func.getPath('userBanner', now);
  const aid = AM.getNewId();
  await resizeImage(file.path, PATH.resolve(fileFolder, `./${aid}.${ext}`), 400, 800, 95);
  const attachment = AM({
    _id: aid,
    toc: now,
    size: file.size,
    name: file.name,
    ext,
    type: 'userBanner',
    uid,
    hash: file.hash
  });
  await attachment.save();
  const log = await db.ImageLogModel({
    uid,
    imgType: "userBanner",
    imgId: aid,
    type: "userChangeBanner"
  });
  await log.save();
  await user.updateOne({banner: aid});
  return aid;
};

/*
* 删除用户背景
* @param {String} uid 用户ID
* @author pengxiguaa 2019-8-2
* */
exports.deleteUserBanner = async (uid) =>{
  const user = await db.UserModel.findOnly({uid});
  await user.updateOne({banner: ""});
};

/*
* 获取文章封面
* @param {String} hash 图片hash
* @author pengxiguaa 2019-9-17
* */
exports.getPostCover = async (hash) => {
  let filePath = upload.coverPath + "/" + hash + ".jpg";
  if(!hash || !await func.access(filePath)) {
    filePath = statics.defaultPostCoverPath;
  }
  return filePath;
};

/*
* 修改resource的封面
* @param {String} resource id
* @param {File} 图像数据
* @author pengxiguaa 2019-10-16
* */
exports.saveResourceCover = async (rid, file) => {
  const resource = await db.ResourceModel.findOnly({rid});
  const {hash, path} = file;
  const filePath = upload.coverPath + "/" + hash + ".jpg";
  await ei.resize({
    src: path,
    dst: filePath,
    height: 400,
    width: 400,
    background: "#ffffff",
    quality: 90
  });
  await resource.updateOne({cover: hash});
  await fsSync.unlink(path);
};

/*
* 修改post的封面图
* @param {String} pid postID
* @param {[Object]} covers 封面图数据
*   {
*     type: String, // hash: 已保存的封面图，file: 新的封面图
*     data: String/file hash值/文件对象
*   }
* @author pengxiguaa 2019-9-17
* */
exports.modifyPostCovers = async (pid, covers) => {
  const post = await db.PostModel.findOnly({pid});
  let coversHash = [], files = [];
  for(const c of covers) {
    const {type, data} = c;
    if(type === "hash") {
      coversHash.push(data);
    } else if(type === "file") {
      files.push(data);
      coversHash.push(data.hash);
    }
  }
  // 删掉旧的封面图
  for(const c of post.covers) {
    if(!coversHash.includes(c)) { // 修改后，删除了原有的封面图
      const filePath = upload.coverPath + "/" + c + ".jpg";
      if(func.access(filePath)) {
        await fsSync.unlink(filePath);
      }
    }
  }
  for(const file of files) {
    const {path, hash} = file;
    const filePath = upload.coverPath + "/" + hash + ".jpg";
    await ei.resize({
      src: path,
      dst: filePath,
      height: 400,
      width: 800,
      background: "#ffffff",
      quality: 90
    });
  }
  await post.updateOne({covers: coversHash});
};

/*
  根据postID生成封面图
*/
exports.createPostCoverByPostId = async (pid) => {
  const post = await db.PostModel.findOne({pid});
  if(!post) return;
  const ext = ["jpg", "jpeg", "bmp", "png", "mp4"];
  const cover = await db.ResourceModel.findOne({ext: {$in: ext}, references: pid});
  if(cover) {
    let filePath;
    if(cover.ext === "mp4") {
      filePath = upload.frameImgPath + "/" + cover.rid + ".jpg";
    } else {
      filePath = await cover.getFilePath();
    }
    if(!await func.access(filePath)) return;
    // if(!fsSync.existsSync(filePath)) return;
    const targetPath = upload.coverPath + "/" + pid + ".jpg";
    await ei.resize({
      src: filePath,
      dst: targetPath,
      height: 400,
      background: "#ffffff",
      width: 800,
      quality: 90
    });
    await post.updateOne({cover: pid});
  }
};
/*
* 首页指定文章封面图
* */
exports.saveHomeAdCover = async (file, type) => {
  const {hash, path} = file;
  const filePath = upload.coverPath + "/" + hash + ".jpg";
  let height = 253, width = 400;
  if(type === "movable") {
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
};
/*
* 检查文件类型与格式是否对应，返回文件格式
* */
exports.getFileExtension = async (file, extensions = []) => {
  // let extension = await FileType.fromFile(file.path);
  let extension;
  const pathExtension = PATH.extname(file.name).replace('.', '').toLowerCase();
  if(extension) {
    extension = extension.ext;
  } else {
    extension = pathExtension;
  }
  if(extension !== pathExtension) {
    const jpgArr = ['jpg', 'jpeg'];
    if(!jpgArr.includes(extension) || !jpgArr.includes(pathExtension)) {
      throwErr(400, `文件内容格式(${extension})与后缀名(${pathExtension})无法对应`);
    }
  }
  if(!extension) throwErr(400, '未知的文件格式');
  if(extensions.length) {
    if(!extensions.includes(extension)) {
      throwErr(400, `文件格式不被允许，请选择${extensions.join(', ')}格式的文件。`);
    }
  }
  return extension;
}

/*
* 手动构建File对象
* @param {String} filePath 文件路径
* */
exports.getFileObjectByFilePath = async (filePath) => {
  const HASH = require('../nkcModules/hash');
  const name = PATH.basename(filePath);
  const ext = PATH.extname(filePath).replace('.', '');
  const hash = await HASH.getFileMD5(filePath);
  const stats = await fsPromise.stat(filePath);
  const size = stats.size;
  return {
    path: filePath,
    name,
    ext,
    stats,
    hash,
    size,
    mediaType: func.getMediaTypeByExtension(ext),
  };
}

/*
* 检查给定路径时否存在
* @param {String} targetPath
* @return {Boolean}
* @author pengxiguaa 2020/8/10
* */
exports.exist = async (targetPath) => {
  try{
    await fsPromise.stat(targetPath);
    return true;
  } catch(err) {
    return false;
  }
};

/*
* 同上
* */
exports.access = async (targetPath) => {
  try{
    await fsPromise.access(targetPath);
    return true;
  } catch(err) {
    return false;
  }
}

/**
 * 重设图片尺寸
 * 参数：
 * fromFile, toFile[, height[, width[, quality]]]
 * 尺寸参数只传入一个时既做高又做宽
 * @param {string} fromFile - 目标文件路径
 * @param {string} toFile - 新文件路径
 */
function resizeImage(fromFile, toFile) {
  let height = 48;
  let width = 48;
  let quality = 90;
  if(typeof arguments[2] === "number" && typeof arguments[3] !== "number") {
    height = arguments[2], width = arguments[2];
  } else if(typeof arguments[2] === "number" && typeof arguments[3] === "number") {
    height = arguments[2], width = arguments[3];
  }
  if(typeof arguments[4] === "number") {
    quality = arguments[4];
  }
  return ei.resize({
    src: fromFile,
    dst: toFile,
    height,
    width,
    quality
  });
}
