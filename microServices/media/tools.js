const fsPromises = require('fs').promises;
const Path = require('path');
const storeConfigs = require('../../config/store');
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
  const stat = await fsPromises.stat(filePath);
  if(stat.isFile()) {
    await fsPromises.unlink(filePath);
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


module.exports = {
  moveFile,
  getTargetFilePath,
  getDiskPath,
  parseRange
}