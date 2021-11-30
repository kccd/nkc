const PATH = require('path');
const {storeClient, getFileInfo, deleteFile} = require('../../tools');
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
    ext
  } = data;

  const filePath = file.path;
  const filenamePath = `${mfId}.${ext}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  await storeClient(storeUrl, {
    path,
    time,
    filePath
  });
  const fileInfo = await getFileInfo(filePath);
  fileInfo.name = filenamePath;
  await deleteFile(filePath);
  return {
    def: fileInfo
  };
};