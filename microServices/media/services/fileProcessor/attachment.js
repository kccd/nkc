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
      filename,
      height,
      width,
      quality,
      disposition,
      background = 'transparent'
    } = image;
    const path = PATH.join(mediaPath, timePath, filename);
    const targetFilePath = filePath + '.temp.' + filename;
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
    const {size, hash, ext, height: newHeight, width: newWidth} = await getFileInfo(targetFilePath);
    filesInfo[type] = {
      ext,
      size,
      hash,
      filename,
      disposition,
      height: newHeight,
      width: newWidth
    };
  }
  await storeClient(storeUrl, storeFiles);
  for(const s of storeFiles) {
    await deleteFile(s.filePath);
  }
  return filesInfo;
}