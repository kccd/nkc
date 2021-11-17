const fs = require("fs");
const fsPromises = fs.promises;
const Path = require('path');
const storeConfigs = require('../../config/store');
const PATH = require("path");
const crypto = require("crypto");
const {spawn} = require("child_process");
const FormData = require("form-data");
const axios = require("axios");

const {platform} = require("os");
const ff = require("fluent-ffmpeg");
const os = platform();
const linux = (os === 'linux');

/*
  获取文件的md5
  @param {String} path 文件路径
  @return {String} md5
  @author pengxiguaa 2019-10-31
*/
async function getFileMD5(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, err => {
      try{
        if(err) return reject(err);
        const stream = fs.createReadStream(filePath);
        const hmac = crypto.createHash("md5");
        stream.on("data", (chunk) => {
          hmac.update(chunk);
        });
        stream.on("end", () => {
          resolve(hmac.digest("hex"));
        });
        stream.on("error", err => {
          reject(err);
        });
      } catch(err) {
        reject(err);
      }
    });
  });
}

/*
* 移动文件
* @param {String} path 源文件路径
* @param {String} targetPath 目标路径
* */
async function moveFile(path, targetPath) {
  const dirname = Path.dirname(targetPath);
  await fsPromises.mkdir(dirname, {recursive: true});
  await fsPromises.copyFile(path, targetPath);
  await deleteFile(path);
}

/*
* 获取磁盘目录
* @param {Date} time 附件上传日期
* @return {String}
* */
async function getDiskPath(time) {
  let diskPath;
  for(const a of storeConfigs.attachment) {
    const startingTime = new Date(`${a.startingTime} 00:00:00`);
    const endTime = new Date(`${a.endTime} 00:00:00`);
    time = new Date(time);
    if(time < startingTime || time >= endTime) continue;
    diskPath = a.path;
    break;
  }
  if(!diskPath) throw new Error(`未找到匹配的文件目录`);
  return diskPath;
}

/*
* 获取最终文件存储目录
* @param {Date} time 文件上传时间
* @param {String} destination 文件的相对目录
* @return {String}
* */
async function getTargetFilePath(time, destination) {
  const diskPath = await getDiskPath(time);
  return Path.resolve(diskPath, destination);
}

/*
* 删除文件
* @param {String} 文件路径
* */
async function deleteFile(filePath) {
  if(!await accessFile(filePath)) return;
  const stat = await fsPromises.stat(filePath);
  if(stat.isFile()) {
    await fsPromises.unlink(filePath);
  }
}

/*
* 获取文件大小
* @param {String} 文件路径
* */
async function getFileSize(filePath) {
  const stat = await fsPromises.stat(filePath);
  return stat.size;
}

/*
* 获取文件信息
* */
async function getFileInfo(filePath) {
  const name = PATH.basename(filePath);
  const ext = PATH.extname(filePath).replace('.', '');
  const hash = await getFileMD5(filePath);
  const stats = await fsPromises.stat(filePath);
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

async function accessFile(targetPath) {
  try{
    await fsPromises.access(targetPath);
    return true;
  } catch(err) {
    return false;
  }
}

/*
* 解析 header range
* */
async function parseRange(str, size) {
  if (str.indexOf(",") !== -1) {
    return;
  }
  if(str.indexOf("=") !== -1){
    str = str.substr(6, str.length)
  }
  const range = str.split("-");
  let start = parseInt(range[0], 10)
  let end = parseInt(range[1], 10) || size - 1

  // Case: -100
  if (isNaN(start)) {
    start = size - end;
    end = size - 1;
    // Case: 100-
  } else if (isNaN(end)) {
    end = size - 1;
  }

  // Invalid
  if (isNaN(start) || isNaN(end) || start > end || end > size) {
    return;
  }
  return {
    start: start,
    end: end
  };
}

async function spawnProcess(pathName, args, options = {}) {
  return new Promise((resolve, reject) => {
    const bat = spawn(pathName, args, options);
    let data = '';
    let err = '';
    bat.stdout.on('data', (d) => {
      data += `${d}\n`;
    });
    bat.stderr.on('data', (e) => {
      err += `${e}\n`;
    });
    bat.on('close', (code) => {
      if(code !== 0) {
        reject(new Error(err));
      }
      resolve(data);
    });
    bat.on('error', (e) => {
      reject(e);
    })
  })
}


/*
* 推送文件到存储服务
* @param {String} url 存储服务的链接
* @param {[Object]} files 待推送的文件信息
*   @param {String} filePath 文件磁盘路径
*   @param {String} path 文件在存储服务上的目录
*   @param {Number} time 文件上传时间戳
* */
async function storeClient(url, files = []) {
  if(!Array.isArray(files)) {
    files = [files];
  }
  const formData = new FormData();
  const filesInfo = {};
  for(let i = 0; i < files.length; i++) {
    const {filePath, path, time} = files[i];
    const key = `file_${i}`;
    filesInfo[key] = {
      path,
      time
    };
    formData.append(key, fs.createReadStream(filePath));
  }
  formData.append('filesInfo', JSON.stringify(filesInfo));
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'POST',
      maxBodyLength: Infinity,
      data: formData,
      headers: formData.getHeaders()
    })
      .then(resolve)
      .catch(reject);
  });
}

/*
* 获取图片宽高
* */
async function getPictureSize(pictureFilePath) {
  const args = ['identify', '-format', '%wx%h', pictureFilePath + `[0]`];
  let result;
  if(!linux) {
    result = await spawnProcess('magick', args);
  } else {
    result = await spawnProcess(args.shift(), args);
  }
  result = result.replace('\n', '');
  result = result.trim();
  const [width, height] = result.split('x');
  return {
    height: Number(height),
    width: Number(width)
  };
}

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
* 获取视频信息
* @param {String} inputFilePath 视频路径
* @return {Object}
*   @param {Object} format
*     @param {}
* */
async function getVideoInfo(inputFilePath) {
  return new Promise((resolve, reject) => {
    ff.ffprobe(inputFilePath, (err, metadata) => {
      if(err) return reject(err);
      const {streams} = metadata;
      const videoInfo = streams.filter(stream => stream["codec_type"] === "video").shift();
      if(!videoInfo) {
        return reject(new Error("cannot get video stream detail"));
      }
      const {
        width, height, r_frame_rate, duration, bit_rate, display_aspect_ratio
      } = videoInfo;
      const arr = r_frame_rate.split('/');
      resolve({
        width,
        height,
        duration: Math.round(duration),
        bitRate: bit_rate,
        displayAspectRatio: display_aspect_ratio,
        fps: Number((arr[0] / arr[1]).toFixed(1))
      });
    });
  })
}

async function getAudioInfo(filePath) {
  return new Promise((resolve, reject) => {
    ff.ffprobe(filePath, (err, metadata) => {
      if(err) return reject(err);
      const {streams} = metadata;
      const audioInfo = streams.filter(stream => stream['codec_type'] === 'audio').shift();
      if(!audioInfo) {
        return reject(new Error('Cannot get audio stream detail'));
      }
      const {
        duration
      } = audioInfo;
      resolve({
        duration: Math.round(duration)
      });
    })
  });
}


module.exports = {
  moveFile,
  replaceFileExtension,
  deleteFile,
  accessFile,
  getVideoInfo,
  getAudioInfo,
  getTargetFilePath,
  getDiskPath,
  getFileInfo,
  getFileSize,
  spawnProcess,
  parseRange,
  storeClient,
  getPictureSize
}