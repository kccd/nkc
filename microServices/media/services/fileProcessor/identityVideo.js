const ff = require("fluent-ffmpeg");
const PATH = require('path');
const {
  getFileInfo,
  storeClient,
  deleteFile,
} = require('../../tools');
const {sendMessageToNkc} = require('../../socket')
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
  const func = async () => {
    await videoToMP4(filePath, targetFilePath);
    await storeClient(storeUrl, {
      filePath: targetFilePath,
      path,
      time
    });
    const fileInfo = await getFileInfo(targetFilePath);
    fileInfo.name = filenamePath;
    await sendMessageToNkc('verifiedUploadState', {
      vid,
      status: true,
      fileInfo,
    });
  }

  func()
    .catch(err => {
      //处理成功修改该条数据的处理状态
      sendMessageToNkc('verifiedUploadState', {
        vid,
        status: false,
        error: err.message || err.toString(),
      });
    })
    .finally(() => {
      return Promise.all([
        deleteFile(targetFilePath),
        deleteFile(filePath),
      ]);
    })
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