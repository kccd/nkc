const PATH = require('path');
const {
  storeClient,
  getFileInfo,
  deleteFile,
  spawnProcess,
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
  } = data;

  const filePath = file.path;
  const ext = 'mp4';
  const targetFilePath = filePath + `.temp.${ext}`;
  const filenamePath = `${mfId}.${ext}`;
  const coverExt = 'jpg';
  const coverFilePath = filePath + `.temp_cover.${coverExt}`;
  const coverFilenamePath = `${mfId}_cover.${coverExt}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const coverPath = PATH.join(mediaPath, timePath, coverFilenamePath);
  const time = (new Date(toc)).getTime();
  await videoToMP4(filePath, targetFilePath);
  await videoToCover(filePath, coverFilePath);
  const storeData = [
    {
      path,
      time,
      filePath: targetFilePath
    },
    {
      path: coverPath,
      time,
      filePath: coverFilePath
    }
  ];
  await storeClient(storeUrl, storeData);
  const videoFileInfo = await getFileInfo(targetFilePath);
  videoFileInfo.name = filenamePath;
  const coverFileInfo = await getFileInfo(coverFilePath);
  coverFileInfo.name = coverFilenamePath;
  await deleteFile(filePath);
  await deleteFile(targetFilePath);
  await deleteFile(coverFilePath);
  return {
    def: videoFileInfo,
    cover: coverFileInfo
  };
};

/*
* 将视频文件转换为 MP4 格式
* @param {String} filePath 原视频文件路径
* @param {String} outputPath 输出视频文件路径
* */
function videoToMP4(filePath, outputPath) {
  return new Promise((resolve, reject) => {
    ff(filePath)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  });
}

function videoToCover(filePath, coverPath) {
  return spawnProcess('ffmpeg',['-i',filePath, '-ss', '1', '-vframes' ,'1', coverPath])
}