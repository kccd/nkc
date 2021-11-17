const ff = require("fluent-ffmpeg");
const PATH = require('path');
const {
  getFileInfo,
  storeClient,
  deleteFile,
  getVideoInfo,
  replaceFileExtension,
} = require('../../tools');
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;
  const {mediaPath, timePath, vid, toc, disposition} = data;
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
  const {width, height, duration} = await getVideoInfo(targetFilePath);
  const {size, hash} = await getFileInfo(targetFilePath);
  const filesInfo = {
    def: {
      ext,
      size,
      hash,
      height,
      width,
      duration,
      filename: filenamePath,
      disposition: await replaceFileExtension(disposition, ext),
    }
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