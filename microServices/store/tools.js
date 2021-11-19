const fsPromises = require('fs').promises;
const storeConfigs = require('../../config/store');
const PATH = require("path");
const fs = require("fs");
const crypto = require("crypto");
const {spawn} = require("child_process");
const {platform} = require("os");
const ff = require("fluent-ffmpeg");
const os = platform();
const linux = (os === 'linux');

const imageExtensions = ["jpg", "jpeg", "png", "bmp", "svg", "gif", "webp"];
const videoExtensions = ["mp4", "mov", "3gp", "avi", 'webm'];
const audioExtensions = ["wav", "amr", "mp3", "aac", 'flac'];

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
* 获取图片宽高
* */
async function getImageInfo(pictureFilePath) {
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


/*
* 获取音频信息
* @param {String} filePath 音频路径
* @return {Object}
*   @Param {Number} duration 音频时长 秒
* */
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

/*
* 移动文件
* @param {String} path 源文件路径
* @param {String} targetPath 目标路径
* */
async function moveFile(path, targetPath) {
  const dirname = PATH.dirname(targetPath);
  await fsPromises.mkdir(dirname, {recursive: true});
  await fsPromises.copyFile(path, targetPath);
  await deleteFile(path);
}

/*
* 获取磁盘目录
* @param {Number} time 附件上传日期时间戳
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

async function accessFile(targetPath) {
  try{
    await fsPromises.access(targetPath);
    return true;
  } catch(err) {
    return false;
  }
}

/*
* 获取最终文件存储目录
* @param {Number} time 文件上传时间戳
* @param {String} destination 文件的相对目录
* @return {String}
* */
async function getTargetFilePath(time, path) {
  const diskPath = await getDiskPath(time);
  return PATH.resolve(diskPath, path);
}

/*
* 删除文件
* @param {String} 文件路径
* */
async function deleteFile(filePath) {
  const stat = await fsPromises.stat(filePath);
  if(stat.isFile()) {
    await fsPromises.unlink(filePath);
  }
}

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
* 获取文件信息
* @param {String} filePath 文件路径
* @return {Object}
*   @param {String} path 文件路径
*   @param {String} name 文件名
*   @param {String} ext 文件格式
*   @param {Object} stats
*   @param {String} hash
*   @param {Number} size
*   @param {Date} atime
*   @param {Date} mtime
*   @param {Date} ctime
*   @param {Date} birthtime
*
*   @param {Number} height 视频、图片高
*   @param {Number} width 视频、图片宽
*   @param {Number} duration 音视频时长 秒
* */
async function getFileInfo(filePath) {
  const name = PATH.basename(filePath);
  const ext = PATH.extname(filePath).replace('.', '');
  const hash = await getFileMD5(filePath);
  const {
    size,
    mtime,
  } = await fsPromises.stat(filePath);

  const fileInfo = {
    path: filePath,
    name,
    ext,
    hash,
    size,
    mtime,
  };

  let height = 0;
  let width = 0;
  let duration = 0;

  if(imageExtensions.includes(ext)) {
    try{
      const imageInfo = await getImageInfo(filePath);
      height = imageInfo.height;
      width = imageInfo.width;
    } catch(err) {}
  } else if(videoExtensions.includes(ext)) {
    try{
      const videoInfo = await getVideoInfo(filePath);
      height = videoInfo.height;
      width = videoInfo.width;
      duration = videoInfo.duration;
    } catch(err) {}
  } else if(audioExtensions.includes(ext)) {
    try {
      const audioInfo = await getAudioInfo(filePath);
      duration = audioInfo.duration;
    } catch(err) {}
  }

  fileInfo.height = height;
  fileInfo.width = width;
  fileInfo.duration = duration;

  return fileInfo;
}

async function getFilePathByTime(year, month) {
  const {attachment} = storeConfigs;
  const monthStr = month < 10? month + '0': month + '';
  const yearStr = year + '';
  const getChildFolder = async (folderPath) => {
    const arr = [];
    const folders = await fsPromises.readdir(folderPath);
    for(const folderName of folders) {
      const childFolderPath = PATH.resolve(folderPath, `./${folderName}`);
      const stat = await fsPromises.stat(childFolderPath);
      if(!stat.isDirectory()) continue;
      arr.push({
        name: folderName,
        path: childFolderPath
      });
    }
    return arr;
  };
  const filesPath = [];
  for(const a of attachment) {
    const startTime = (new Date(a.startingTime + ' 00:00:00')).getTime();
    const disk = a.path;
    const diskPath = PATH.resolve(disk);
    const mediaTypeTopFolders = await getChildFolder(diskPath);
    for(const mediaTypeTopFolder of mediaTypeTopFolders) {
      const {
        name: mediaTypeTopFolderName,
        path: mediaTypeTopFolderPath
      } = mediaTypeTopFolder;
      const mediaTypeBottomFolders = await getChildFolder(mediaTypeTopFolderPath);
      for(const mediaTypeBottomFolder of mediaTypeBottomFolders) {
        const {
          name: mediaTypeBottomFolderName,
          path: mediaTypeBottomFolderPath
        } = mediaTypeBottomFolder;
        const dateFolderPath = PATH.resolve(mediaTypeBottomFolderPath, `./${yearStr}/${monthStr}`);
        try{
          await fsPromises.access(dateFolderPath);
          const files = await fsPromises.readdir(dateFolderPath);
          if(files.length === 0) continue;
          for(const file of files) {
            const filePath = PATH.resolve(dateFolderPath, file);
            const stat = await fsPromises.stat(filePath);
            if(stat.isDirectory()) continue;
            const ext = PATH.extname(file);
            if(!ext) continue;
            filesPath.push(
              [
                stat.size,
                PATH.join(mediaTypeTopFolderName, mediaTypeBottomFolderName, yearStr, monthStr, file),
                startTime
              ]
            );
          }
        } catch(err) {}
      }
    }
  }
  return filesPath;
}

/*
* 解析 header range
* */
async function parseRange(str, size) {
  if(str.includes(',')) return;
  if(str.includes('=')) {
    str = str.substr(6, str.length);
  }
  const range = str.split("-");
  let start = parseInt(range[0], 10)
  let end = parseInt(range[1], 10) || size - 1;
  if (isNaN(start)) {
    start = size - end;
    end = size - 1;
  } else if (isNaN(end)) {
    end = size - 1;
  }
  if (isNaN(start) || isNaN(end) || start > end || end > size) {
    return;
  }
  return {
    start: start,
    end: end
  };
}


module.exports = {
  moveFile,
  getTargetFilePath,
  getFilePathByTime,
  getDiskPath,
  accessFile,
  getVideoInfo,
  getImageInfo,
  getAudioInfo,
  getFileInfo,
  getFileMD5,
  parseRange
}