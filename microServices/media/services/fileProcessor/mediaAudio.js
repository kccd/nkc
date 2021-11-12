const ff = require("fluent-ffmpeg");
const PATH = require('path');
const {getFileInfo, deleteFile} = require('../../tools');
const {sendResourceStatusToNKC} = require('../../socket');
const storeClient = require('../../../../tools/storeClient');
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;
  const {mediaPath, timePath, rid, toc} = data;
  const filePath = file.path;
  const targetFilePath = filePath + `.temp.mp3`;
  const filenamePath = `${rid}.mp3`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  audioToMP3(filePath, targetFilePath)
    .then(() => {
      return storeClient(storeUrl, {
        filePath: targetFilePath,
        path,
        time
      });
    })
    .then(() => {
      return getFileInfo(targetFilePath);
    })
    .then(fileInfo => {
      const {size, hash, ext} = fileInfo;
      return sendResourceStatusToNKC({
        rid,
        status: true,
        filesInfo: {
          default: {
            ext,
            size,
            hash,
            filename: filenamePath
          }
        }
      });
    })
    .catch(err => {
      return sendResourceStatusToNKC({
        rid,
        status: false,
        error: err.message || err.toString()
      });
    })
    .then(() => {
      return deleteFile(filePath);
    })
    .then(() => {
      return deleteFile(targetFilePath);
    })
    .catch(console.error);
};

/*
* 将音频文件转换为 MP3 格式
* @param {String} filePath 原音频文件
* @param {String} outputPath 输出音频文件格式
* */
function audioToMP3(filePath, outputPath) {
  return new Promise((resolve, reject) => {
    ff(filePath)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  });
}