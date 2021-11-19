const ff = require("fluent-ffmpeg");
const PATH = require('path');
const {
  getFileInfo,
  storeClient,
  deleteFile,
} = require('../../tools');
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;
  const {mediaPath, timePath, vid, toc} = data;
  const filePath = file.path;
  const ext = 'mp4';
  const targetFilePath = file.path + `.temp.${ext}`;
  const filenamePath = `${vid}.${ext}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  await videoToMP4(filePath, targetFilePath);
  await storeClient(storeUrl, {
    filePath: targetFilePath,
    path,
    time
  });
  const fileInfo = await getFileInfo(targetFilePath);
  fileInfo.name = filenamePath;
  const filesInfo = {
    def: fileInfo
  };
  await deleteFile(filePath);
  await deleteFile(targetFilePath);
  return filesInfo;
};


async function videoToMP4(filePath, outputPath) {
  return new Promise((resolve, reject) => {
    ff(filePath)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  });
}