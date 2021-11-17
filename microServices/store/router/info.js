const {
  getTargetFilePath,
  getFileInfo,
  accessFile
} = require("../tools");
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  const {time, path} = query;
  const filePath = await getTargetFilePath(Number(time), path);
  data.fileLost = !await accessFile(filePath);
  if(!data.fileLost) {
    data.fileInfo = await getFileInfo(filePath);
  }
  await next();
};