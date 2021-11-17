const PATH = require('path');
const {
  storeClient,
  getFileInfo,
  deleteFile,
  replaceFileExtension
} = require('../../tools');
const ff = require("fluent-ffmpeg");
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;

  const {
    mfId,
    timePath,
    mediaPath,
    toc,
    disposition,
  } = data;

  const filePath = file.path;
  const ext = 'mp3';
  const targetFilePath = filePath + `.temp.${ext}`;
  const filenamePath = `${mfId}.${ext}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  await audioToMP3(filePath, targetFilePath);
  await storeClient(storeUrl, {
    path,
    time,
    filePath: targetFilePath
  });
  const {size, hash, duration} = await getFileInfo(targetFilePath);
  await deleteFile(filePath);
  await deleteFile(targetFilePath);
  return {
    def: {
      ext,
      size,
      hash,
      duration,
      filename: filenamePath,
      disposition: replaceFileExtension(disposition, 'mp3')
    }
  };
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