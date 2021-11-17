const ei = require("easyimage");
const PATH = require('path');
const {
  storeClient,
  getPictureSize,
  deleteFile,
  getFileInfo
} = require("../../tools");
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
  const targetSMFilePath = filePath + `.temp_sm.${ext}`;
  const filenamePath = `${mfId}.${ext}`;
  const smFilenamePath = `${mfId}_sm.${ext}`;
  const time = (new Date(toc)).getTime();
  const storeData = [
    {
      path: PATH.join(mediaPath, timePath, filenamePath),
      time,
      filePath
    },
    {
      path: PATH.join(mediaPath, timePath, smFilenamePath),
      time,
      filePath: targetSMFilePath
    }
  ];
  await ei.resize({
    src: filePath,
    dst: targetSMFilePath,
    height: 200,
    width: 300,
    quality: 90,
  });
  await storeClient(storeUrl, storeData);
  const fileInfoSize = await getPictureSize(filePath);
  const fileInfo = await getFileInfo(filePath);
  const smFileInfoSize = await getPictureSize(targetSMFilePath);
  const smFileInfo = await getFileInfo(targetSMFilePath);
  const filesInfo = {
    def: {
      ext: fileInfo.ext,
      size: fileInfo.size,
      hash: fileInfo.hash,
      height: fileInfoSize.height,
      width: fileInfoSize.width,
      filename: filenamePath,
      disposition
    },
    sm: {
      ext: smFileInfo.ext,
      size: smFileInfo.size,
      hash: smFileInfo.hash,
      height: smFileInfoSize.height,
      width: smFileInfoSize.width,
      filename: smFilenamePath,
      disposition
    }
  };
  await deleteFile(filePath);
  await deleteFile(targetSMFilePath);
  return filesInfo;
};