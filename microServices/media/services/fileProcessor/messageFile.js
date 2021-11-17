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
    disposition,
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
  const {size, hash} = await getFileInfo(filePath);
  await deleteFile(filePath);
  return {
    def: {
      ext,
      size,
      hash,
      filename: filenamePath,
      disposition
    }
  };
};