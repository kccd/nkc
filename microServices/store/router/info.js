const {
  getTargetFilePath,
  getFileInfo,
  accessFile
} = require("../tools");
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  const files = JSON.parse(query.files);
  const filesInfo = {};
  for(const type in files) {
    const {time, path} = files[type];
    const filePath = await getTargetFilePath(Number(time), path);
    const fileLost = !await accessFile(filePath);
    let fileInfo = null;
    if(!fileLost) {
      fileInfo = await getFileInfo(filePath);
    }
    filesInfo[type] = {
      fileLost,
      fileInfo
    };
  }
  data.filesInfo = filesInfo;
  await next();
};