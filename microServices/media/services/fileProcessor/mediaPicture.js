const ff = require("fluent-ffmpeg");
const PATH = require('path');
const {getFileInfo, deleteFile, storeClient} = require('../../tools');
module.exports = async (props) => {
  const {
    file,
    cover,
    data,
    storeUrl
  } = props;
  const {waterGravity, mediaPath, timePath, rid, toc, ext} = data;
  const filePath = file.path;//临时目录
  const {size} = file;
  const filenamePath = `${rid}.${ext}`;
  const targetFilePath = filePath + `.temp.jpg`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  const storeData = [{
    filePath: filePath,
    path,
    time,
  }];
  const fileInfo = {};//用于存储在数据库的文件类型
  //识别图片信息并自动旋转，去掉图片的元信息
  await imageMagick.allInfo(filePath);
  //获取图片尺寸
  const {height, width} = await imageMagick.info(filePath);
  //缩略图
  const thumbnailPath = PATH.resolve(filePath, '');
  //中图
  const  mediumPath = PATH.resolve(filePath, '');
  //保存图片的原图，缩略图，中图，大图
  if(width > 150 || size > 51200 && ext !== 'gif') {

  }

  // ffmpegWaterMark(filePath, cover, waterGravity)
  //   .then(() => {
  //     return getFileInfo(targetFilePath);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  //
  // Promise.resolve()
  //   .then(() => {
  //
  //   })ffmpegWaterMark(filePath, cover, waterGravity)
  //   .then(() => {
  //     return getFileInfo(targetFilePath);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  //
  // Promise.resolve()
  //   .then(() => {
  //
  //   })
  //图片打水印
  function ffmpegWaterMark(filePath, cover, waterGravity){

  }
}