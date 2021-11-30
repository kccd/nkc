const ei = require("easyimage");
const PATH = require('path');
const {
  getFileInfo,
  deleteFile,
  storeClient
} = require('../../tools');
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;
  const {
    timePath,
    mediaPath,
    toc,
    images = []
  } = data;
  const time = (new Date(toc)).getTime();
  const filePath = file.path;
  const storeFiles = [];
  const filesInfo = {};
  for(const image of images) {
    const {
      type,
      name,
      height,
      width,
      quality,
      background = 'transparent'
    } = image;
    const path = PATH.join(mediaPath, timePath, name);
    const targetFilePath = filePath + '.temp.' + name;
    await ei.resize({
      src: filePath,
      dst: targetFilePath,
      height,
      width,
      quality,
      background
    });
    storeFiles.push({
      filePath: targetFilePath,
      path,
      time
    });
    const fileInfo = await getFileInfo(targetFilePath);
    fileInfo.name = name;
    filesInfo[type] = fileInfo;
  }
  await storeClient(storeUrl, storeFiles);
  for(const s of storeFiles) {
    await deleteFile(s.filePath);
  }
  return filesInfo;
}