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
  const {mediaPath, timePath, vid, toc, ext} = data;
  const filePath = file.path;
  const filenamePath = `${vid}.${ext}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  await storeClient(storeUrl, {
    filePath: filePath,
    path,
    time
  });
  const fileInfo = await getFileInfo(filePath);
  fileInfo.name = filenamePath;
  const filesInfo = {
    def: fileInfo
  };
  await deleteFile(filePath);
  return filesInfo;
};