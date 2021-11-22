const fs = require("fs");
const fsPromise = fs.promises;
const moment = require('moment');
const PATH = require('path');
const axios = require("axios");
const attachmentConfig = require("../config/attachment.json");

const pictureExtensions = ["jpg", "jpeg", "png", "bmp", "svg", "gif", "webp"];
const videoExtensions = ["mp4", "mov", "3gp", "avi", 'webm'];
const audioExtensions = ["wav", "amr", "mp3", "aac", 'flac'];
const breakpointExtensions = ['mp4', 'mp3', 'pdf'];

/*
* resource 文件目录的组成如下：
* storeUrl + mediaPath + timePath + filenamePath
* */

/*
* 根据时间获取存储服务的链接
* @param {Date} 附件上传时间
* @reture {String} 存储服务的链接
* */
async function getStoreUrl(t) {
  const now = t? (new Date(t)).getTime(): Date.now();
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
}

/*
* 根据文件类型获取文件类型所在目录
* 例如用户上传的音频：resource/audio
* 目录列表：settings/fileFolder.js
* @param {String} 附件类型
* @return {String}
* */
async function getMediaPath(type) {
  const fileFolder = require('../settings/fileFolder');
  return fileFolder[type];
}
/*
* 根据时间获取年月组成的目录
* 例如：2021/11
* @param {Date} t 时间
* @return {String}
* */
async function getTimePath(t) {
  return moment(t).format(`YYYY/MM`);
}

/*
* 检查文件类型与格式是否对应，返回文件格式
* @param {File} file 文件对象
* @param {[String]} 格式白名单
* @return {String} 文件格式
* */
async function getFileExtension(file, extensions = []) {
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
async function getFileSizeByFilePath(filePath) {
  const stats = await fsPromise.stat(filePath);
  return stats.size;
}

/*
* 手动构建File对象
* @param {String} filePath 文件路径
* */
async function getFileObjectByFilePath(filePath) {
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
  };
}


/*
* 判断是否有权访问文件或目录
* */
async function access(targetPath) {
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
async function createStoreQueryUrl(storeUrl, time, path) {
  const url = new URL(storeUrl);
  url.searchParams.set('path', path);
  url.searchParams.set('time', time);
  return url.toString();
}

/*
* 替换文件格式
* */

function replaceFileExtension(filename, newExtension) {
  if(!filename) throw new Error(`文件名不能为空`);
  if(!newExtension) throw new Error(`新的文件格式不能为空`);
  filename = filename.split('.');
  if(filename.length > 1) {
    filename.pop();
  }
  filename.push(newExtension);
  filename = filename.join('.');
  return filename;
}

/*
* 从 store service 获取附件信息
* @param {String} storeUrl store service 链接
* @param {[Object]} files
*   @param {String} type 自定义属性
*   @param {Number} time 文件上传时间
*   @param {String} path 文件在 store service 上的相对目录
* @return {[Object]}
*   @param {String} type 自定义属性
*   @param {Number} time 文件上传时间
*   @param {String} path 文件在 store service 上的相对目录
*
*   @param {Boolean} lost 文件是否丢失
*   @param {Object} info 文件信息 来自 store service tools.getFileInfo
* */
async function getStoreFilesInfo(storeUrl, files) {
  return new Promise((resolve, reject) => {
    axios({
      url: storeUrl,
      method: 'GET',
      params: {
        files: JSON.stringify(files)
      }
    })
      .then(res => {
        resolve(res.data || res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/*
* 过滤 files 对象上的字段
* resource attachment verifiedUpload messageFile 适用
* */
function filterFilesInfo(files) {
  const newFiles = {};
  for(const type in files) {
    const {
      name,
      ext,
      hash,
      size,
      mtime,
      height,
      width,
      duration
    } = files[type];
    newFiles[type] = {
      name,
      ext,
      hash,
      size,
      mtime,
      height,
      width,
      duration
    }
  }
  return newFiles;
}

/*
* 获取 store service 上的文件信息
* @param {Date} 文件上传时间
* @param {String} folderType 文件夹类型
* @param {Object} filenames 键为文件类型，值为 store service 上的文件名
* */
async function getStoreFilesInfoObj(toc, folderType, filenames) {
  const storeUrl = await getStoreUrl(toc) + '/info';
  const mediaPath = await getMediaPath(folderType);
  const time = (new Date(toc)).getTime();
  const timePath = await getTimePath(toc);
  const files = [];
  for(const type in filenames) {
    const filename = filenames[type];
    files.push({
      type,
      time,
      path: PATH.join(mediaPath, timePath, filename)
    });
  }
  const res = await getStoreFilesInfo(storeUrl, files);
  const filesObj = {};
  for(const file of res.files) {
    const {lost, info, type} = file;
    if(lost) continue;
    filesObj[type] = info;
  }
  return filterFilesInfo(filesObj);
}

async function getRemoteFile(props) {
  const {
    id,
    toc,
    type,
    ext,
    name,
    file
  } = props;
  const storeUrl = await getStoreUrl(toc);
  const mediaPath = await getMediaPath(type);
  const timePath = await getTimePath(toc);
  const time = (new Date(toc)).getTime();
  const defaultFile = {
    ext,
    name: `${id}.${ext}`
  };
  const targetFile = file || defaultFile;
  targetFile.name = targetFile.name || defaultFile.name;
  const filename = replaceFileExtension(name, targetFile.ext);
  const path = PATH.join(mediaPath, timePath, targetFile.name);
  const storeQueryUrl = await createStoreQueryUrl(storeUrl, time, path);
  return {
    url: storeQueryUrl,
    filename,
    info: file
  }
}

module.exports = {
  videoExtensions,
  pictureExtensions,
  audioExtensions,
  breakpointExtensions,
  getStoreUrl,
  getMediaPath,
  getTimePath,
  getStoreFilesInfoObj,
  getFileExtension,
  getFileSizeByFilePath,
  getFileObjectByFilePath,
  access,
  getRemoteFile,
  filterFilesInfo,
  createStoreQueryUrl,
  getStoreFilesInfo,
  replaceFileExtension,
}