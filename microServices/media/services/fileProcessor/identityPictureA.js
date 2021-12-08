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
  const {mediaPath, timePath, vid, toc, ext} = data;
  const filePath = file.path;
  const filenamePath = `${vid}.${ext}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  const func = async () => {
    await storeClient(storeUrl, {
      filePath: filePath,
      path,
      time
    });
    const fileInfo = await getFileInfo(filePath);
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
        deleteFile(filePath),
      ]);
    })
 };
