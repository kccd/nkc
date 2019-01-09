const path = require('path');
const diskOptions = require("./diskCharacterOptions");
const mediaPathOptions = require("./mediaPathOptions");

// 获取文件下载路径
/**
 * para对象参数
 * toc 时间
 * mediaType 文件类型，用来找取文件路径
 */
function selectDiskCharacterDown(para) {
  // 根据toc获取盘符
  let diskMark = "";
  let finalPath;
  let tocStamp = new Date(para.toc).getTime();
  for(let d of diskOptions) {
    if(d.diskStartTime < tocStamp && d.diskEndTime >= tocStamp) {
      diskMark = d.diskName;
      break;
    }
  }
  // 根据para.mediaType获取pathObj中的路径
  for(let op of mediaPathOptions){
    if(op.mediaType == para.mediaType){
      finalPath = diskMark + op.path;
    }
  }
  return finalPath;
}


// 获取文件上传路径
function selectDiskCharacterUp(mediaType) {
  let diskMark = "";
  let finalPath = "";
  let nowTimeStamp = new Date().getTime();
  for(let d of diskOptions) {
    if(d.diskStartTime < nowTimeStamp && d.diskEndTime >= nowTimeStamp) {
      diskMark = d.diskName;
      break;
    }
  }
  if(diskMark == ""){
    diskMark = "G:"
  }
  for(var op of mediaPathOptions){
    if(op.mediaType == mediaType){
      finalPath = diskMark + op.path;
    }
  }
  return finalPath;
}

const mediaPathFunc = {
  selectDiskCharacterDown,
  selectDiskCharacterUp
}

module.exports = Object.assign(
  mediaPathFunc
);