const path = require('path');
const diskOptions = require("./diskCharacterOptions");
const mediaPathOptions = require("./mediaPathOptions");

const mediaPicturePath = '/media/picture';
const mediaVideoPath = '/media/video';
const mediaAudioPath = '/media/audio';
const mediaAttachmentPath = '/media/attachment';

// 获取文件下载路径
/**
 * para对象参数
 * path 2018/02/123456.jpg
 * ext jpg
 * type media
 */
function selectDiskCharacterDown(para) {
  // 根据para.path获取盘符
  let paraYear;
  let paraMonth;
  let diskMark = "";
  let finalPath = "";
  let paraArr = para.path.split("/");
  for(let p = 0;p < paraArr.length;p++){
    if(paraArr[p].length < 1 || paraArr[p].length > 4){
      continue;
    }
    if(paraArr[p].length == "4"){
      paraYear = paraArr[p];
    }
    if(paraArr[p].length == "2"){
      paraMonth = paraArr[p];
    }
  }
  let timeStr = paraYear + "-" + paraMonth + "-01 00:00:00";
  let paraTimeStr = new Date(timeStr).getTime();
  for(let d of diskOptions) {
    if(d.diskStartTime < paraTimeStr && d.diskEndTime >= paraTimeStr) {
      diskMark = d.diskName;
      break;
    }
  }
  if(diskMark == ""){
    diskMark = "C:"
  }
  // 根据para.type 和 para.ext获取pathObj中的路径
  for(let op of mediaPathOptions){
    if(op.type == para.type){
      finalPath = diskMark + op.path;
    }
  }
  return finalPath;
}


// 获取文件上传路径
function selectDiskCharacterUp(type) {
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
    diskMark = "C:"
  }
  for(var op of mediaPathOptions){
    if(op.type == type){
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