const PATH = require('path');
const {
  getFileInfo,
  storeClient,
  getPictureSize,
  deleteFile,
} = require('../../tools');
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;
  const {mediaPath, timePath, vid, toc, ext, disposition} = data;
  const filePath = file.path;
  const filenamePath = `${vid}.${ext}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  await storeClient(storeUrl, {
    filePath: filePath,
    path,
    time
  });
  const {size, hash} = await getFileInfo(filePath);
  const {
    height,
    width
  } = await getPictureSize(filePath);
  const filesInfo = {
    def: {
      ext,
      size,
      hash,
      height,
      width,
      filename: filenamePath,
      disposition,
    }
  };
  await deleteFile(filePath);
  return filesInfo;
};