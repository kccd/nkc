const fs = require("fs");
const fsPromise = fs.promises;
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
* resource 文件目录的组成如下：
* storeUrl + mediaPath + timePath + filenamePath
* */

/*
* 根据时间获取存储服务的链接
* @param {Date} 附件上传时间
* @reture {String} 存储服务的链接
* */
exports.getStoreUrl = async (t) => {
  let now;
  if(t) {
    now = new Date(t).getTime();
  } else {
    now = Date.now();
  }
  let storeUrl;
  for(const a of attachmentConfig) {
    let {url, startingTime, endTime} = a;
    const sTime = new Date(startingTime + ' 00:00:00').getTime();
    const eTime = new Date(endTime + ' 00:00:00').getTime();
    if(now >= sTime && now < eTime) {
      storeUrl = url;
      break;
    }
  }
  if(!storeUrl) throwErr `未找到与时间匹配的存储服务，请检查文件 attachment.json 中的配置是否正确`;
  return storeUrl;
};

/*
* 根据文件类型获取文件类型所在目录
* 例如用户上传的音频：resource/audio
* 目录列表：settings/fileFolder.js
* @param {String} 附件类型
* @return {String}
* */
exports.getMediaPath = async (type) => {
  const fileFolder = require('../settings/fileFolder');
  return fileFolder[type];
};
/*
* 根据时间获取年月组成的目录
* 例如：2021/11
* @param {Date} t 时间
* @return {String}
* */
exports.getTimePath = async (t) => {
  return moment(t).format(`YYYY/MM`);
};

exports.getBasePath = async (t) => {
  return await func.getStoreUrl(t);
}

exports.getFullPath = async (p, t) => {
  const path = PATH.resolve(await func.getBasePath(t), p);
  if(path.indexOf('http') !== 0) {
    await mkdirp(path);
  }
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
  return await func.getMediaPath(type);
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

/*
* 检查文件类型与格式是否对应，返回文件格式
* @param {File} file 文件对象
* @param {[String]} 格式白名单
* @return {String} 文件格式
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
* 获取文件大小
* @param {String} filePath 文件路径
* @param {Number} 文件大小 字节
* */
exports.getFileSizeByFilePath = async (filePath) => {
  const stats = await fsPromise.stat(filePath);
  return stats.size;
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
* 判断是否有权访问文件或目录
* */
exports.access = async (targetPath) => {
  try{
    await fsPromise.access(targetPath);
    return true;
  } catch(err) {
    return false;
  }
}

/*
* 构建在 store service 取文件的url
* @param {String} storeUrl store service 链接
* @param {Number} time 文件的上传时间戳
* @param {String} path 文件在 store service 上的路径
* @return {String}
* */
exports.createStoreQueryUrl = (storeUrl, time, path) => {
  const url = new URL(storeUrl);
  url.searchParams.set('path', path);
  url.searchParams.set('time', time);
  return url.toString();
}
