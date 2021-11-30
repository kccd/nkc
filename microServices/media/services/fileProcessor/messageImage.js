const ei = require("easyimage");
const PATH = require('path');
const {
  storeClient,
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
  const fileInfo = await getFileInfo(filePath);
  fileInfo.name = filenamePath;
  const smFileInfo = await getFileInfo(targetSMFilePath);
  smFileInfo.name = smFilenamePath;
  const filesInfo = {
    def: fileInfo,
    sm: smFileInfo
  };
  await deleteFile(filePath);
  await deleteFile(targetSMFilePath);
  return filesInfo;
};